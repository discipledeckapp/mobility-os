import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../database/prisma.service';
import { IntelligenceClient } from '../intelligence/intelligence.client';

type SupportedConditionType =
  | 'shortfall_count'
  | 'missed_submission'
  | 'unresolved_dispute'
  | 'risk_score';

type SupportedActionType = 'flag' | 'restrict' | 'suspend' | 'require_review' | 'notify_operator';

export type EnforcementSummary = {
  id: string;
  actionType: string;
  reason: string;
  status: string;
  triggeredAt: Date;
  policyRuleId?: string | null;
};

const DEFAULT_POLICY_RULES: Array<{
  name: string;
  conditionType: SupportedConditionType;
  threshold: number;
  timeWindowDays: number;
  actionType: SupportedActionType;
  appliesTo: 'driver';
}> = [
  {
    name: 'Repeated shortfalls',
    conditionType: 'shortfall_count',
    threshold: 3,
    timeWindowDays: 5,
    actionType: 'flag',
    appliesTo: 'driver',
  },
  {
    name: 'Missed submissions',
    conditionType: 'missed_submission',
    threshold: 2,
    timeWindowDays: 5,
    actionType: 'restrict',
    appliesTo: 'driver',
  },
  {
    name: 'Unresolved remittance dispute',
    conditionType: 'unresolved_dispute',
    threshold: 2,
    timeWindowDays: 2,
    actionType: 'require_review',
    appliesTo: 'driver',
  },
  {
    name: 'High intelligence risk score',
    conditionType: 'risk_score',
    threshold: 70,
    timeWindowDays: 30,
    actionType: 'require_review',
    appliesTo: 'driver',
  },
];

@Injectable()
export class PolicyService {
  private readonly logger = new Logger(PolicyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly intelligenceClient: IntelligenceClient,
  ) {}

  async ensureDefaultRules(tenantId: string) {
    const count = await this.prisma.policyRule.count({ where: { tenantId } });
    if (count > 0) {
      return;
    }

    await this.prisma.policyRule.createMany({
      data: DEFAULT_POLICY_RULES.map((rule) => ({
        tenantId,
        ...rule,
      })),
    });
  }

  async listRules(tenantId: string) {
    await this.ensureDefaultRules(tenantId);
    return this.prisma.policyRule.findMany({
      where: { tenantId },
      orderBy: [{ isActive: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async listActions(
    tenantId: string,
    filters: { entityType?: string; entityId?: string; status?: string } = {},
  ) {
    return this.prisma.enforcementAction.findMany({
      where: {
        tenantId,
        ...(filters.entityType ? { entityType: filters.entityType } : {}),
        ...(filters.entityId ? { entityId: filters.entityId } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      },
      orderBy: [{ status: 'asc' }, { triggeredAt: 'desc' }],
    });
  }

  async listActiveActionsByEntityIds(tenantId: string, entityType: string, entityIds: string[]) {
    if (entityIds.length === 0) {
      return new Map<string, EnforcementSummary[]>();
    }

    const rows = await this.prisma.enforcementAction.findMany({
      where: {
        tenantId,
        entityType,
        entityId: { in: entityIds },
        status: 'active',
      },
      orderBy: { triggeredAt: 'desc' },
    });

    const byEntityId = new Map<string, EnforcementSummary[]>();
    for (const row of rows) {
      const existing = byEntityId.get(row.entityId) ?? [];
      existing.push({
        id: row.id,
        actionType: row.actionType,
        reason: row.reason,
        status: row.status,
        triggeredAt: row.triggeredAt,
        policyRuleId: row.policyRuleId,
      });
      byEntityId.set(row.entityId, existing);
    }

    return byEntityId;
  }

  async evaluateDriverPolicies(tenantId: string, driverId: string) {
    await this.ensureDefaultRules(tenantId);

    const [driver, rules] = await Promise.all([
      this.prisma.driver.findUnique({
        where: { id: driverId },
        select: { id: true, personId: true, firstName: true, lastName: true, status: true },
      }),
      this.prisma.policyRule.findMany({
        where: { tenantId, appliesTo: 'driver', isActive: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    if (!driver || driver.status === 'terminated') {
      return [];
    }

    const now = new Date();
    const results: EnforcementSummary[] = [];

    for (const rule of rules) {
      const thresholdMet = await this.evaluateRuleThreshold(tenantId, driverId, driver.personId, rule);
      const activeAction = await this.prisma.enforcementAction.findFirst({
        where: {
          tenantId,
          entityType: 'driver',
          entityId: driverId,
          policyRuleId: rule.id,
          status: 'active',
        },
      });

      if (thresholdMet.met) {
        const reason = this.buildReason(rule, thresholdMet.value, thresholdMet.detail);
        const metadata = {
          measuredValue: thresholdMet.value,
          measuredAt: now.toISOString(),
          detail: thresholdMet.detail,
        } satisfies Prisma.InputJsonValue;

        if (!activeAction) {
          const created = await this.prisma.enforcementAction.create({
            data: {
              tenantId,
              policyRuleId: rule.id,
              entityType: 'driver',
              entityId: driverId,
              actionType: rule.actionType,
              status: 'active',
              reason,
              metadata,
            },
          });
          await this.auditService.recordTenantAction({
            tenantId,
            entityType: 'driver',
            entityId: driverId,
            action: 'policy_enforcement_triggered',
            afterState: {
              actionType: created.actionType,
              reason: created.reason,
              policyRuleId: created.policyRuleId,
            },
            metadata,
          });
          results.push({
            id: created.id,
            actionType: created.actionType,
            reason: created.reason,
            status: created.status,
            triggeredAt: created.triggeredAt,
            policyRuleId: created.policyRuleId,
          });
        } else {
          if (activeAction.reason !== reason) {
            await this.prisma.enforcementAction.update({
              where: { id: activeAction.id },
              data: { reason, metadata },
            });
          }
          results.push({
            id: activeAction.id,
            actionType: activeAction.actionType,
            reason,
            status: activeAction.status,
            triggeredAt: activeAction.triggeredAt,
            policyRuleId: activeAction.policyRuleId,
          });
        }
      } else if (activeAction) {
        await this.prisma.enforcementAction.update({
          where: { id: activeAction.id },
          data: {
            status: 'resolved',
            resolvedAt: now,
            resolvedReason: 'The policy condition is no longer met.',
          },
        });
      }
    }

    return results.sort((left, right) => right.triggeredAt.getTime() - left.triggeredAt.getTime());
  }

  applyDriverEnforcement(
    readiness: {
      authenticationAccess: 'ready' | 'not_ready';
      authenticationAccessReasons: string[];
      activationReadiness: 'ready' | 'partially_ready' | 'not_ready';
      activationReadinessReasons: string[];
      assignmentReadiness: 'ready' | 'partially_ready' | 'not_ready';
      assignmentReadinessReasons: string[];
      remittanceReadiness: 'ready' | 'partially_ready' | 'not_ready';
      remittanceReadinessReasons: string[];
    },
    actions: EnforcementSummary[],
  ) {
    if (actions.length === 0) {
      return {
        ...readiness,
        enforcementStatus: 'clear' as const,
        enforcementActions: [],
      };
    }

    const assignmentReasons = [...readiness.assignmentReadinessReasons];
    const activationReasons = [...readiness.activationReadinessReasons];
    const remittanceReasons = [...readiness.remittanceReadinessReasons];

    for (const action of actions) {
      if (action.actionType === 'flag' || action.actionType === 'notify_operator') {
        assignmentReasons.push(action.reason);
        continue;
      }

      assignmentReasons.push(action.reason);
      activationReasons.push(action.reason);

      if (action.actionType === 'suspend') {
        remittanceReasons.push('Collections are suspended while this driver is under enforcement review.');
      }
    }

    return {
      ...readiness,
      activationReadiness: actions.some((action) => action.actionType === 'require_review')
        ? 'not_ready'
        : readiness.activationReadiness,
      activationReadinessReasons: uniqueStrings(activationReasons),
      assignmentReadiness: actions.some((action) =>
        ['restrict', 'suspend', 'require_review'].includes(action.actionType),
      )
        ? 'not_ready'
        : readiness.assignmentReadiness,
      assignmentReadinessReasons: uniqueStrings(assignmentReasons),
      remittanceReadiness: actions.some((action) => action.actionType === 'suspend')
        ? 'not_ready'
        : readiness.remittanceReadiness,
      remittanceReadinessReasons: uniqueStrings(remittanceReasons),
      authenticationAccess: readiness.authenticationAccess,
      authenticationAccessReasons: readiness.authenticationAccessReasons,
      enforcementStatus: actions.some((action) =>
        ['restrict', 'suspend', 'require_review'].includes(action.actionType),
      )
        ? ('restricted' as const)
        : ('flagged' as const),
      enforcementActions: actions,
    };
  }

  async assertAssignmentEligible(tenantId: string, driverId: string) {
    await this.evaluateDriverPolicies(tenantId, driverId);
    const actions = await this.listActiveActionsByEntityIds(tenantId, 'driver', [driverId]);
    const blocking = (actions.get(driverId) ?? []).find((action) =>
      ['restrict', 'suspend', 'require_review'].includes(action.actionType),
    );

    if (blocking) {
      throw new Error(blocking.reason);
    }
  }

  private async evaluateRuleThreshold(
    tenantId: string,
    driverId: string,
    personId: string | null,
    rule: {
      id: string;
      conditionType: string;
      threshold: number;
      timeWindowDays: number;
      actionType: string;
      name: string;
    },
  ): Promise<{ met: boolean; value: number; detail: string }> {
    const windowStart = new Date();
    windowStart.setUTCDate(windowStart.getUTCDate() - Math.max(rule.timeWindowDays, 1));

    switch (rule.conditionType as SupportedConditionType) {
      case 'shortfall_count': {
        const value = await this.prisma.remittance.count({
          where: {
            tenantId,
            driverId,
            createdAt: { gte: windowStart },
            shortfallAmountMinorUnits: { gt: 0 },
          },
        });
        return {
          met: value >= rule.threshold,
          value,
          detail: `${value} shortfall record(s) in the last ${rule.timeWindowDays} day(s).`,
        };
      }
      case 'missed_submission': {
        const assignments = await this.prisma.assignment.findMany({
          where: {
            tenantId,
            driverId,
            startedAt: { gte: windowStart },
            status: { in: ['active', 'ended'] },
          },
          select: { id: true, status: true, startedAt: true },
        });
        const remittanceCounts = await this.prisma.remittance.groupBy({
          by: ['assignmentId'],
          where: {
            tenantId,
            driverId,
            assignmentId: { in: assignments.map((assignment) => assignment.id) },
          },
          _count: { _all: true },
        });
        const remittanceCountByAssignmentId = new Map(
          remittanceCounts.map((item) => [item.assignmentId, item._count._all]),
        );
        const value = assignments.filter(
          (assignment) => (remittanceCountByAssignmentId.get(assignment.id) ?? 0) === 0,
        ).length;
        return {
          met: value >= rule.threshold,
          value,
          detail: `${value} assignment(s) have no remittance submission inside the policy window.`,
        };
      }
      case 'unresolved_dispute': {
        const value = await this.prisma.remittance.count({
          where: {
            tenantId,
            driverId,
            status: 'disputed',
            updatedAt: { lte: windowStart },
          },
        });
        return {
          met: value >= rule.threshold,
          value,
          detail: `${value} disputed remittance record(s) have stayed unresolved beyond ${rule.timeWindowDays} day(s).`,
        };
      }
      case 'risk_score': {
        if (!personId) {
          return {
            met: false,
            value: 0,
            detail: 'Risk score policy skipped because no canonical person is linked yet.',
          };
        }
        try {
          const risk = await this.intelligenceClient.queryPersonRisk(personId);
          const value = risk.globalRiskScore ?? 0;
          return {
            met: value >= rule.threshold,
            value,
            detail: `Canonical person risk score is ${value}.`,
          };
        } catch (error) {
          this.logger.warn(
            `Risk-score policy evaluation failed for driver '${driverId}': ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
          return {
            met: false,
            value: 0,
            detail: 'Risk score policy could not be evaluated right now.',
          };
        }
      }
      default:
        return { met: false, value: 0, detail: 'Unsupported policy condition.' };
    }
  }

  private buildReason(
    rule: {
      name: string;
      threshold: number;
      timeWindowDays: number;
      actionType: string;
      conditionType: string;
    },
    value: number,
    detail: string,
  ) {
    return `${rule.name}: ${value} matched against threshold ${rule.threshold} in ${rule.timeWindowDays} day(s). ${detail}`;
  }
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}
