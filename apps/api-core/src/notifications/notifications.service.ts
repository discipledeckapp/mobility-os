import { TenantRole } from '@mobility-os/authz-model';
import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS DI requires a runtime value for constructor metadata.
import { ConfigService } from '@nestjs/config';
import type { Prisma, User, UserNotification, UserPushDevice } from '@prisma/client';
import {
  NOTIFICATION_TOPICS,
  type NotificationPreferenceMap,
  type NotificationTopic,
  readUserSettings,
  writeUserSettings,
} from '../auth/user-settings';
// biome-ignore lint/style/useImportType: NestJS DI requires a runtime value for constructor metadata.
import { PrismaService } from '../database/prisma.service';
import { getDefaultLanguageForCountry, readOrganisationSettings } from '../tenants/tenant-settings';
// biome-ignore lint/style/useImportType: NestJS DI requires a runtime value for constructor metadata.
import { ZeptoMailService } from './zeptomail.service';

type NotificationRecipient = Pick<
  User,
  'id' | 'tenantId' | 'email' | 'name' | 'role' | 'driverId' | 'settings'
>;

type RecipientScope = {
  assignedFleetIds: string[];
  assignedVehicleIds: string[];
};

type NotificationPayload = {
  topic: NotificationTopic;
  title: string;
  body: string;
  actionUrl?: string | null;
  metadata?: Record<string, unknown>;
};

@Injectable()
export class NotificationsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationsService.name);
  private intervalHandle: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly mailer: ZeptoMailService,
  ) {}

  onModuleInit() {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    const intervalMs = Number(this.config.get('NOTIFICATION_REMINDER_INTERVAL_MS') ?? 15 * 60_000);
    if (!Number.isFinite(intervalMs) || intervalMs <= 0) {
      return;
    }

    this.intervalHandle = setInterval(() => {
      void this.syncAllTenantOperationalReminders().catch((error: unknown) => {
        this.logger.error(
          `Automatic reminder sync failed: ${error instanceof Error ? error.message : 'unknown error'}`,
        );
      });
    }, intervalMs);
  }

  onModuleDestroy() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
    }
  }

  private getSupportEmail() {
    return this.config.get<string>('SUPPORT_EMAIL') ?? 'support@mobiris.ng';
  }

  private buildNotificationEmailHtml(input: {
    recipientName: string;
    title: string;
    body: string;
    organisationName?: string | null | undefined;
    actionUrl?: string | null | undefined;
  }) {
    const organisationName = input.organisationName?.trim();
    const actionMarkup = input.actionUrl
      ? `<p style="margin-top:20px;"><a href="${input.actionUrl}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:700;">Open Mobiris</a></p>`
      : '';

    return `
      <div style="font-family:Inter,Segoe UI,Arial,sans-serif;background:#f8fafc;padding:24px;color:#0f172a;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;padding:28px;">
          <div style="font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#2563eb;">${organisationName ? `${organisationName} via Mobiris` : 'Mobiris notification'}</div>
          <h1 style="margin:12px 0 0;font-size:24px;line-height:1.2;">${input.title}</h1>
          <p style="margin:16px 0 0;font-size:15px;line-height:1.7;color:#334155;">Hello ${input.recipientName}, ${input.body}</p>
          ${actionMarkup}
          <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#64748b;">${organisationName ? `If you need clarification, contact ${organisationName}. ` : ''}Need help? Contact ${this.getSupportEmail()}.</p>
        </div>
      </div>
    `.trim();
  }

  private async sendPushDevices(
    devices: UserPushDevice[],
    payload: NotificationPayload,
  ): Promise<void> {
    const activeTokens = devices
      .filter((device) => !device.disabledAt)
      .map((device) => device.deviceToken)
      .filter(
        (token) => token.startsWith('ExponentPushToken[') || token.startsWith('ExpoPushToken['),
      );

    if (activeTokens.length === 0) {
      return;
    }

    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          activeTokens.map((to) => ({
            to,
            sound: 'default',
            title: payload.title,
            body: payload.body,
            data: {
              topic: payload.topic,
              actionUrl: payload.actionUrl ?? null,
              ...(payload.metadata ?? {}),
            },
          })),
        ),
      });

      if (!response.ok) {
        this.logger.warn(`Push delivery failed with status ${response.status}`);
      }
    } catch (error) {
      this.logger.warn(
        `Push delivery failed: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }
  }

  private getUserPreferences(
    user: NotificationRecipient,
    tenantCountry?: string | null,
  ): NotificationPreferenceMap {
    return readUserSettings(user.settings, {
      preferredLanguage: getDefaultLanguageForCountry(tenantCountry ?? undefined),
      role: user.role,
      hasLinkedDriver: Boolean(user.driverId),
    }).notificationPreferences;
  }

  private getRecipientScope(user: NotificationRecipient): RecipientScope {
    const settings = readUserSettings(user.settings, {
      preferredLanguage: 'en',
      role: user.role,
      hasLinkedDriver: Boolean(user.driverId),
    });

    return {
      assignedFleetIds: settings.assignedFleetIds,
      assignedVehicleIds: settings.assignedVehicleIds,
    };
  }

  private recipientCanAccessVehicle(
    recipient: NotificationRecipient,
    input: { fleetId: string; vehicleId: string; driverId?: string | null },
  ) {
    if (recipient.driverId) {
      return recipient.driverId === input.driverId;
    }

    const scope = this.getRecipientScope(recipient);
    if (scope.assignedVehicleIds.length > 0) {
      return scope.assignedVehicleIds.includes(input.vehicleId);
    }
    if (scope.assignedFleetIds.length > 0) {
      return scope.assignedFleetIds.includes(input.fleetId);
    }
    return true;
  }

  private async hasRecentDuplicate(
    userId: string,
    topic: NotificationTopic,
    actionUrl: string | null | undefined,
    since: Date,
  ) {
    const existing = await this.prisma.userNotification.findFirst({
      where: {
        userId,
        topic,
        actionUrl: actionUrl ?? null,
        createdAt: { gte: since },
      },
      select: { id: true },
    });

    return Boolean(existing);
  }

  async getControlPlaneOversight(input: { tenantId?: string } = {}) {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [notifications, unreadCount, pushDevices, groupedTopics] = await Promise.all([
      this.prisma.userNotification.findMany({
        where: {
          ...(input.tenantId ? { tenantId: input.tenantId } : {}),
          createdAt: { gte: last30Days },
        },
        orderBy: { createdAt: 'desc' },
        take: 120,
        select: {
          id: true,
          tenantId: true,
          userId: true,
          topic: true,
          title: true,
          body: true,
          actionUrl: true,
          readAt: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.userNotification.count({
        where: {
          ...(input.tenantId ? { tenantId: input.tenantId } : {}),
          readAt: null,
        },
      }),
      this.prisma.userPushDevice.findMany({
        where: {
          ...(input.tenantId ? { tenantId: input.tenantId } : {}),
          disabledAt: null,
        },
        select: {
          tenantId: true,
          userId: true,
          platform: true,
          lastSeenAt: true,
        },
      }),
      this.prisma.userNotification.groupBy({
        by: ['topic'],
        where: {
          ...(input.tenantId ? { tenantId: input.tenantId } : {}),
          createdAt: { gte: last30Days },
        },
        _count: { _all: true },
      }),
    ]);

    const tenantSummaries = new Map<
      string,
      {
        notificationsLast30Days: number;
        unreadNotifications: number;
        pushDevices: number;
        pushEnabledUsers: Set<string>;
        lastNotificationAt: Date | null;
      }
    >();

    for (const notification of notifications) {
      const current = tenantSummaries.get(notification.tenantId) ?? {
        notificationsLast30Days: 0,
        unreadNotifications: 0,
        pushDevices: 0,
        pushEnabledUsers: new Set<string>(),
        lastNotificationAt: null,
      };
      current.notificationsLast30Days += 1;
      if (!notification.readAt) {
        current.unreadNotifications += 1;
      }
      if (!current.lastNotificationAt || notification.createdAt > current.lastNotificationAt) {
        current.lastNotificationAt = notification.createdAt;
      }
      tenantSummaries.set(notification.tenantId, current);
    }

    for (const device of pushDevices) {
      const current = tenantSummaries.get(device.tenantId) ?? {
        notificationsLast30Days: 0,
        unreadNotifications: 0,
        pushDevices: 0,
        pushEnabledUsers: new Set<string>(),
        lastNotificationAt: null,
      };
      current.pushDevices += 1;
      current.pushEnabledUsers.add(device.userId);
      tenantSummaries.set(device.tenantId, current);
    }

    const topicCounts = Object.fromEntries(
      groupedTopics.map((item) => [item.topic, item._count._all]),
    ) as Record<string, number>;

    return {
      generatedAt: now.toISOString(),
      totals: {
        notificationsLast30Days: notifications.length,
        unreadNotifications: unreadCount,
        pushDevices: pushDevices.length,
        pushEnabledUsers: new Set(pushDevices.map((device) => device.userId)).size,
        tenantsWithUnreadNotifications: Array.from(tenantSummaries.values()).filter(
          (summary) => summary.unreadNotifications > 0,
        ).length,
        verificationNotifications:
          (topicCounts.driver_verification_status ?? 0) +
          (topicCounts.driver_licence_review_pending ?? 0) +
          (topicCounts.driver_licence_review_resolved ?? 0),
        remittanceNotifications:
          (topicCounts.remittance_due ?? 0) +
          (topicCounts.remittance_overdue ?? 0) +
          (topicCounts.remittance_reconciled ?? 0) +
          (topicCounts.late_remittance_risk ?? 0),
        assignmentNotifications:
          (topicCounts.assignment_issued ?? 0) +
          (topicCounts.assignment_accepted ?? 0) +
          (topicCounts.assignment_changed ?? 0) +
          (topicCounts.assignment_ended ?? 0),
        complianceRiskNotifications: topicCounts.compliance_risk ?? 0,
      },
      tenantSummaries: Array.from(tenantSummaries.entries()).map(([tenantId, summary]) => ({
        tenantId,
        notificationsLast30Days: summary.notificationsLast30Days,
        unreadNotifications: summary.unreadNotifications,
        pushDevices: summary.pushDevices,
        pushEnabledUsers: summary.pushEnabledUsers.size,
        lastNotificationAt: summary.lastNotificationAt?.toISOString() ?? null,
      })),
      notifications: notifications.map((notification) => ({
        ...notification,
        createdAt: notification.createdAt.toISOString(),
        readAt: notification.readAt?.toISOString() ?? null,
      })),
    };
  }

  async createNotificationForUser(
    user: NotificationRecipient,
    payload: NotificationPayload,
    options: {
      tenantCountry?: string | null;
      dedupeWithinHours?: number;
      organisationName?: string | null;
    } = {},
  ): Promise<UserNotification | null> {
    const preferences = this.getUserPreferences(user, options.tenantCountry);
    const topicPreferences = preferences[payload.topic];
    if (!topicPreferences) {
      return null;
    }

    const dedupeWithinHours = options.dedupeWithinHours ?? 18;
    const hasDuplicate = await this.hasRecentDuplicate(
      user.id,
      payload.topic,
      payload.actionUrl,
      new Date(Date.now() - dedupeWithinHours * 60 * 60 * 1000),
    );
    if (hasDuplicate) {
      return null;
    }

    let notification: UserNotification | null = null;

    if (topicPreferences.inApp) {
      const data: Prisma.UserNotificationCreateInput = {
        tenantId: user.tenantId,
        user: { connect: { id: user.id } },
        topic: payload.topic,
        title: payload.title,
        body: payload.body,
        actionUrl: payload.actionUrl ?? null,
      };
      if (payload.metadata !== undefined) {
        data.metadata = payload.metadata as Prisma.InputJsonValue;
      }
      notification = await this.prisma.userNotification.create({
        data,
      });
    }

    if (topicPreferences.email && user.email) {
      try {
        const emailShellInput =
          payload.actionUrl !== undefined
            ? {
                recipientName: user.name,
                title: payload.title,
                body: payload.body,
                organisationName: options.organisationName,
                actionUrl: payload.actionUrl,
              }
            : {
                recipientName: user.name,
                title: payload.title,
                body: payload.body,
                organisationName: options.organisationName,
              };
        await this.mailer.sendEmail({
          to: [{ address: user.email, name: user.name }],
          subject: options.organisationName
            ? `${options.organisationName}: ${payload.title}`
            : payload.title,
          htmlBody: this.buildNotificationEmailHtml(emailShellInput),
        });
      } catch (error) {
        this.logger.warn(
          `Email notification failed for ${user.email}: ${error instanceof Error ? error.message : 'unknown error'}`,
        );
      }
    }

    if (topicPreferences.push) {
      const devices = await this.prisma.userPushDevice.findMany({
        where: { userId: user.id, disabledAt: null },
      });
      await this.sendPushDevices(devices, payload);
    }

    return notification;
  }

  async listForUser(tenantId: string, userId: string): Promise<UserNotification[]> {
    return this.prisma.userNotification.findMany({
      where: { tenantId, userId },
      orderBy: [{ createdAt: 'desc' }],
      take: 50,
    });
  }

  async markRead(
    tenantId: string,
    userId: string,
    notificationId: string,
  ): Promise<UserNotification> {
    const notification = await this.prisma.userNotification.findFirst({
      where: { id: notificationId, tenantId, userId },
      select: { id: true },
    });

    if (!notification) {
      throw new Error('Notification not found.');
    }

    return this.prisma.userNotification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });
  }

  async registerPushDevice(
    tenantId: string,
    userId: string,
    input: { deviceToken: string; platform: 'ios' | 'android' | 'web' },
  ): Promise<{ message: string }> {
    await this.prisma.userPushDevice.upsert({
      where: {
        userId_deviceToken: {
          userId,
          deviceToken: input.deviceToken,
        },
      },
      update: {
        platform: input.platform,
        disabledAt: null,
        lastSeenAt: new Date(),
      },
      create: {
        tenantId,
        userId,
        deviceToken: input.deviceToken,
        platform: input.platform,
        lastSeenAt: new Date(),
      },
    });

    return { message: 'Push device registered.' };
  }

  async getPreferences(tenantId: string, userId: string): Promise<NotificationPreferenceMap> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, isActive: true },
      include: { tenant: true },
    });

    if (!user) {
      return readUserSettings(null, {
        preferredLanguage: 'en',
      }).notificationPreferences;
    }

    return this.getUserPreferences(user, user.tenant.country);
  }

  async updatePreferences(
    tenantId: string,
    userId: string,
    nextPreferences: Partial<
      Record<NotificationTopic, Partial<NotificationPreferenceMap[NotificationTopic]>>
    >,
  ): Promise<NotificationPreferenceMap> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, isActive: true },
      include: { tenant: true },
    });

    if (!user) {
      throw new Error('Authenticated session is no longer valid.');
    }

    const currentPreferences = this.getUserPreferences(user, user.tenant.country);
    const mergedPreferences = Object.fromEntries(
      NOTIFICATION_TOPICS.map((topic) => [
        topic,
        {
          ...currentPreferences[topic],
          ...(nextPreferences[topic] ?? {}),
        },
      ]),
    ) as NotificationPreferenceMap;

    const nextSettings = writeUserSettings(
      user.settings,
      {
        notificationPreferences: mergedPreferences,
      },
      {
        preferredLanguage: getDefaultLanguageForCountry(user.tenant.country),
        role: user.role,
        hasLinkedDriver: Boolean(user.driverId),
      },
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: { settings: nextSettings as Prisma.InputJsonValue },
    });

    return readUserSettings(nextSettings, {
      preferredLanguage: getDefaultLanguageForCountry(user.tenant.country),
      role: user.role,
      hasLinkedDriver: Boolean(user.driverId),
    }).notificationPreferences;
  }

  private async getReminderRecipients(
    tenantId: string,
    input: { driverId?: string | null; fleetId: string; vehicleId: string },
  ) {
    const [operatorUsers, linkedDriverUsers] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          tenantId,
          isActive: true,
          role: {
            in: [TenantRole.TenantOwner, TenantRole.FleetManager, TenantRole.FinanceOfficer],
          },
        },
        select: {
          id: true,
          tenantId: true,
          email: true,
          name: true,
          role: true,
          driverId: true,
          settings: true,
        },
      }),
      this.prisma.user.findMany({
        where: {
          tenantId,
          isActive: true,
          ...(input.driverId ? { driverId: input.driverId } : { id: '__never__' }),
        },
        select: {
          id: true,
          tenantId: true,
          email: true,
          name: true,
          role: true,
          driverId: true,
          settings: true,
        },
      }),
    ]);

    return [...operatorUsers, ...linkedDriverUsers].filter((recipient) =>
      this.recipientCanAccessVehicle(recipient, input),
    );
  }

  private async getTenantDriverNotificationRecipients(tenantId: string, driverId: string) {
    const [operatorUsers, linkedDriverUsers] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          tenantId,
          isActive: true,
          role: {
            in: [TenantRole.TenantOwner, TenantRole.FleetManager, TenantRole.FinanceOfficer],
          },
        },
        select: {
          id: true,
          tenantId: true,
          email: true,
          name: true,
          role: true,
          driverId: true,
          settings: true,
        },
      }),
      this.prisma.user.findMany({
        where: { tenantId, driverId, isActive: true },
        select: {
          id: true,
          tenantId: true,
          email: true,
          name: true,
          role: true,
          driverId: true,
          settings: true,
        },
      }),
    ]);

    return {
      operators: operatorUsers,
      driverUsers: linkedDriverUsers,
    };
  }

  private async createDirectDriverEmailNotification(input: {
    email: string;
    name: string;
    title: string;
    body: string;
    organisationName?: string | null;
    actionUrl?: string | null;
  }) {
    try {
      const emailShellInput =
        input.actionUrl !== undefined
          ? {
              recipientName: input.name,
              title: input.title,
              body: input.body,
              organisationName: input.organisationName,
              actionUrl: input.actionUrl,
            }
          : {
              recipientName: input.name,
              title: input.title,
              body: input.body,
              organisationName: input.organisationName,
            };
      await this.mailer.sendEmail({
        to: [{ address: input.email, name: input.name }],
        subject: input.organisationName ? `${input.organisationName}: ${input.title}` : input.title,
        htmlBody: this.buildNotificationEmailHtml(emailShellInput),
      });
    } catch (error) {
      this.logger.warn(
        `Driver email reminder failed for ${input.email}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }
  }

  async syncTenantRemittanceReminders(tenantId: string): Promise<{ created: number }> {
    const todayIso = new Date().toISOString().slice(0, 10);
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, country: true, metadata: true, name: true },
    });

    if (!tenant) {
      return { created: 0 };
    }

    const pendingRemittances = await this.prisma.remittance.findMany({
      where: {
        tenantId,
        status: 'pending',
      },
      orderBy: { dueDate: 'asc' },
    });
    const driverIds = Array.from(new Set(pendingRemittances.map((item) => item.driverId)));
    const drivers = driverIds.length
      ? await this.prisma.driver.findMany({
          where: { tenantId, id: { in: driverIds } },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        })
      : [];
    const driversById = new Map(drivers.map((driver) => [driver.id, driver]));

    let created = 0;

    for (const remittance of pendingRemittances) {
      const isOverdue = remittance.dueDate < todayIso;
      const isDueToday = remittance.dueDate === todayIso;
      if (!isOverdue && !isDueToday) {
        continue;
      }

      const driver = driversById.get(remittance.driverId);
      if (!driver) {
        continue;
      }

      const amount = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: remittance.currency,
        maximumFractionDigits: 2,
      }).format(remittance.amountMinorUnits / 100);
      const companyName =
        readOrganisationSettings(tenant.metadata, tenant.country).branding.displayName ??
        tenant.name;
      const driverFullName = `${driver.firstName} ${driver.lastName}`.trim();
      const recipients = await this.getReminderRecipients(tenantId, {
        driverId: remittance.driverId,
        fleetId: remittance.fleetId,
        vehicleId: remittance.vehicleId,
      });
      const topic: NotificationTopic = isOverdue ? 'remittance_overdue' : 'remittance_due';
      const title = isOverdue
        ? `Overdue remittance for ${driverFullName}`
        : `Remittance due today for ${driverFullName}`;
      const body = isOverdue
        ? `${driverFullName} still has ${amount} awaiting reconciliation for ${remittance.dueDate}. Review the assignment and follow up with the driver and company team.`
        : `${driverFullName} is expected to remit ${amount} today for ${companyName}.`;
      const actionUrl = `/remittance/${remittance.id}`;

      for (const recipient of recipients) {
        const notification = await this.createNotificationForUser(
          recipient,
          {
            topic,
            title,
            body,
            actionUrl,
            metadata: {
              remittanceId: remittance.id,
              driverId: remittance.driverId,
              dueDate: remittance.dueDate,
            },
          },
          { tenantCountry: tenant.country, organisationName: companyName },
        );
        if (notification) {
          created += 1;
        }
      }

      if (
        driver.email &&
        recipients.every((recipient) => recipient.driverId !== remittance.driverId)
      ) {
        await this.createDirectDriverEmailNotification({
          email: driver.email,
          name: driverFullName,
          title,
          body,
          organisationName: companyName,
          actionUrl,
        });
      }
    }

    return { created };
  }

  async syncAllTenantRemittanceReminders(): Promise<{ created: number }> {
    const tenantIds = await this.prisma.remittance.findMany({
      where: { status: 'pending' },
      distinct: ['tenantId'],
      select: { tenantId: true },
    });

    let created = 0;
    for (const item of tenantIds) {
      const result = await this.syncTenantRemittanceReminders(item.tenantId);
      created += result.created;
    }
    return { created };
  }

  async syncTenantMaintenanceReminders(tenantId: string): Promise<{ created: number }> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, country: true, metadata: true, name: true },
    });

    if (!tenant) {
      return { created: 0 };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = today.toISOString().slice(0, 10);
    const schedules = await this.prisma.vehicleMaintenanceSchedule.findMany({
      where: {
        tenantId,
        isActive: true,
        OR: [{ nextDueAt: { not: null } }, { nextDueOdometerKm: { not: null } }],
      },
      include: {
        vehicle: {
          select: {
            id: true,
            fleetId: true,
            odometerKm: true,
            tenantVehicleCode: true,
            systemVehicleCode: true,
            make: true,
            model: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const vehicleIds = Array.from(new Set(schedules.map((schedule) => schedule.vehicleId)));
    const assignments = vehicleIds.length
      ? await this.prisma.assignment.findMany({
          where: {
            tenantId,
            vehicleId: { in: vehicleIds },
            status: { in: ['pending_driver_confirmation', 'active'] },
          },
          orderBy: { startedAt: 'desc' },
          select: {
            vehicleId: true,
            driverId: true,
          },
        })
      : [];
    const driverIds = Array.from(new Set(assignments.map((assignment) => assignment.driverId)));
    const drivers = driverIds.length
      ? await this.prisma.driver.findMany({
          where: { tenantId, id: { in: driverIds } },
          select: { id: true, firstName: true, lastName: true, email: true },
        })
      : [];
    const driversById = new Map(drivers.map((driver) => [driver.id, driver]));
    const activeAssignmentByVehicleId = new Map<string, (typeof assignments)[number]>();
    for (const assignment of assignments) {
      if (!activeAssignmentByVehicleId.has(assignment.vehicleId)) {
        activeAssignmentByVehicleId.set(assignment.vehicleId, assignment);
      }
    }

    let created = 0;
    for (const schedule of schedules) {
      const dueDateIso = schedule.nextDueAt ? schedule.nextDueAt.toISOString().slice(0, 10) : null;
      const overdueByDate = dueDateIso !== null && dueDateIso < todayIso;
      const dueTodayByDate = dueDateIso === todayIso;
      const overdueByOdometer =
        schedule.nextDueOdometerKm !== null &&
        schedule.vehicle.odometerKm !== null &&
        schedule.vehicle.odometerKm > schedule.nextDueOdometerKm;
      const dueByOdometer =
        schedule.nextDueOdometerKm !== null &&
        schedule.vehicle.odometerKm !== null &&
        schedule.vehicle.odometerKm === schedule.nextDueOdometerKm;

      const topic: NotificationTopic | null =
        overdueByDate || overdueByOdometer
          ? 'maintenance_overdue'
          : dueTodayByDate || dueByOdometer
            ? 'maintenance_due'
            : null;

      if (!topic) {
        continue;
      }

      const vehicleLabel =
        schedule.vehicle.tenantVehicleCode ||
        schedule.vehicle.systemVehicleCode ||
        `${schedule.vehicle.make} ${schedule.vehicle.model}`.trim();
      const companyName =
        readOrganisationSettings(tenant.metadata, tenant.country).branding.displayName ??
        tenant.name;
      const assignment = activeAssignmentByVehicleId.get(schedule.vehicleId);
      const recipients = await this.getReminderRecipients(tenantId, {
        driverId: assignment?.driverId ?? null,
        fleetId: schedule.vehicle.fleetId,
        vehicleId: schedule.vehicleId,
      });
      const title =
        topic === 'maintenance_overdue'
          ? `Maintenance overdue for ${vehicleLabel}`
          : `Maintenance due for ${vehicleLabel}`;
      const body =
        topic === 'maintenance_overdue'
          ? `${vehicleLabel} has passed its preventive maintenance threshold in ${companyName}. Review the vehicle immediately and update the maintenance record.`
          : `${vehicleLabel} is due for preventive maintenance today in ${companyName}.`;

      for (const recipient of recipients) {
        const notification = await this.createNotificationForUser(
          recipient,
          {
            topic,
            title,
            body,
            actionUrl: `/vehicles/${schedule.vehicleId}`,
            metadata: {
              vehicleId: schedule.vehicleId,
              maintenanceScheduleId: schedule.id,
              nextDueAt: schedule.nextDueAt?.toISOString() ?? null,
              nextDueOdometerKm: schedule.nextDueOdometerKm ?? null,
            },
          },
          { tenantCountry: tenant.country, dedupeWithinHours: 24, organisationName: companyName },
        );
        if (notification) {
          created += 1;
        }
      }

      const driver = assignment ? driversById.get(assignment.driverId) : null;
      if (
        driver?.email &&
        recipients.every((recipient) => recipient.driverId !== assignment?.driverId)
      ) {
        await this.createDirectDriverEmailNotification({
          email: driver.email,
          name: `${driver.firstName} ${driver.lastName}`.trim(),
          title,
          body,
          organisationName: companyName,
          actionUrl: `/vehicles/${schedule.vehicleId}`,
        });
      }
    }

    return { created };
  }

  async notifyVehicleIncidentReported(input: {
    tenantId: string;
    vehicleId: string;
    fleetId: string;
    driverId?: string | null;
    title: string;
    severity: string;
    incidentId: string;
  }): Promise<{ created: number }> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: input.tenantId },
      select: { id: true, country: true },
    });

    if (!tenant) {
      return { created: 0 };
    }

    const recipients = await this.getReminderRecipients(input.tenantId, {
      driverId: input.driverId ?? null,
      fleetId: input.fleetId,
      vehicleId: input.vehicleId,
    });
    const company = await this.prisma.tenant.findUnique({
      where: { id: input.tenantId },
      select: { country: true, metadata: true, name: true },
    });
    const organisationName = company
      ? (readOrganisationSettings(company.metadata, company.country).branding.displayName ??
        company.name)
      : null;
    let created = 0;

    for (const recipient of recipients) {
      const notification = await this.createNotificationForUser(
        recipient,
        {
          topic: 'vehicle_incident_reported',
          title: 'Vehicle incident reported',
          body: `${input.title} was reported as a ${input.severity} vehicle incident. Review the issue and decide the next action.`,
          actionUrl: `/vehicles/${input.vehicleId}`,
          metadata: {
            vehicleId: input.vehicleId,
            incidentId: input.incidentId,
            driverId: input.driverId ?? null,
          },
        },
        { tenantCountry: tenant.country, dedupeWithinHours: 6, organisationName },
      );
      if (notification) {
        created += 1;
      }
    }

    return { created };
  }

  async notifyDriverVerificationStatus(input: {
    tenantId: string;
    driverId: string;
    driverName: string;
    driverEmail?: string | null;
    organisationName?: string | null;
    tenantCountry?: string | null;
    decision: 'verified' | 'failed' | 'pending';
    detail: string;
    actionUrl: string;
  }): Promise<{ created: number }> {
    const recipients = await this.getTenantDriverNotificationRecipients(
      input.tenantId,
      input.driverId,
    );
    const title =
      input.decision === 'verified'
        ? 'Driver verification completed'
        : input.decision === 'failed'
          ? 'Driver verification failed'
          : 'Driver verification pending';
    let created = 0;

    for (const recipient of [...recipients.operators, ...recipients.driverUsers]) {
      const notification = await this.createNotificationForUser(
        recipient,
        {
          topic: 'driver_verification_status',
          title,
          body: `${input.driverName}: ${input.detail}`,
          actionUrl: input.actionUrl,
          metadata: { driverId: input.driverId, decision: input.decision },
        },
        {
          ...(input.tenantCountry !== undefined ? { tenantCountry: input.tenantCountry } : {}),
          ...(input.organisationName !== undefined
            ? { organisationName: input.organisationName }
            : {}),
        },
      );
      if (notification) created += 1;
    }

    if (input.driverEmail && recipients.driverUsers.length === 0) {
      await this.createDirectDriverEmailNotification({
        email: input.driverEmail,
        name: input.driverName,
        title,
        body: input.detail,
        ...(input.organisationName !== undefined
          ? { organisationName: input.organisationName }
          : {}),
        ...(input.actionUrl ? { actionUrl: input.actionUrl } : {}),
      });
    }

    return { created };
  }

  async notifyDriverLicenceReviewPending(input: {
    tenantId: string;
    driverId: string;
    driverName: string;
    driverEmail?: string | null;
    organisationName?: string | null;
    tenantCountry?: string | null;
    actionUrl: string;
  }): Promise<{ created: number }> {
    const recipients = await this.getTenantDriverNotificationRecipients(
      input.tenantId,
      input.driverId,
    );
    let created = 0;

    for (const recipient of recipients.operators) {
      const notification = await this.createNotificationForUser(
        recipient,
        {
          topic: 'driver_licence_review_pending',
          title: 'Driver licence review required',
          body: `${input.driverName}'s driver licence needs a human review before activation can continue.`,
          actionUrl: input.actionUrl,
          metadata: { driverId: input.driverId },
        },
        {
          ...(input.tenantCountry !== undefined ? { tenantCountry: input.tenantCountry } : {}),
          ...(input.organisationName !== undefined
            ? { organisationName: input.organisationName }
            : {}),
        },
      );
      if (notification) created += 1;
    }

    for (const recipient of recipients.driverUsers) {
      const notification = await this.createNotificationForUser(
        recipient,
        {
          topic: 'driver_licence_review_pending',
          title: 'Driver licence review pending',
          body: 'Your driver’s licence verification is pending review. We will notify you once a decision has been made.',
          actionUrl: '/driver-self-service',
          metadata: { driverId: input.driverId },
        },
        {
          ...(input.tenantCountry !== undefined ? { tenantCountry: input.tenantCountry } : {}),
          ...(input.organisationName !== undefined
            ? { organisationName: input.organisationName }
            : {}),
        },
      );
      if (notification) created += 1;
    }

    if (input.driverEmail && recipients.driverUsers.length === 0) {
      await this.createDirectDriverEmailNotification({
        email: input.driverEmail,
        name: input.driverName,
        title: 'Driver licence review pending',
        body: 'Your driver’s licence verification is pending review. We will notify you once a decision has been made.',
        ...(input.organisationName !== undefined
          ? { organisationName: input.organisationName }
          : {}),
        actionUrl: '/driver-self-service',
      });
    }

    return { created };
  }

  async notifyDriverLicenceReviewResolved(input: {
    tenantId: string;
    driverId: string;
    driverName: string;
    driverEmail?: string | null;
    organisationName?: string | null;
    tenantCountry?: string | null;
    decision: 'approved' | 'rejected' | 'request_reverification';
    actionUrl: string;
  }): Promise<{ created: number }> {
    const recipients = await this.getTenantDriverNotificationRecipients(
      input.tenantId,
      input.driverId,
    );
    const title =
      input.decision === 'approved'
        ? 'Driver licence approved'
        : input.decision === 'rejected'
          ? 'Driver licence rejected'
          : 'Driver licence re-verification requested';
    const operatorBody = `${input.driverName}'s driver licence review was ${input.decision.replace(/_/g, ' ')}.`;
    const driverBody =
      input.decision === 'approved'
        ? 'Your driver’s licence verification has been approved.'
        : input.decision === 'rejected'
          ? 'Your driver’s licence verification was rejected. Please contact your fleet manager or retry when instructed.'
          : 'A new driver’s licence verification is required before onboarding can continue.';
    let created = 0;

    for (const recipient of [...recipients.operators, ...recipients.driverUsers]) {
      const isDriverRecipient = recipient.driverId === input.driverId;
      const notification = await this.createNotificationForUser(
        recipient,
        {
          topic: 'driver_licence_review_resolved',
          title,
          body: isDriverRecipient ? driverBody : operatorBody,
          actionUrl: isDriverRecipient ? '/driver-self-service' : input.actionUrl,
          metadata: { driverId: input.driverId, decision: input.decision },
        },
        {
          ...(input.tenantCountry !== undefined ? { tenantCountry: input.tenantCountry } : {}),
          ...(input.organisationName !== undefined
            ? { organisationName: input.organisationName }
            : {}),
        },
      );
      if (notification) created += 1;
    }

    if (input.driverEmail && recipients.driverUsers.length === 0) {
      await this.createDirectDriverEmailNotification({
        email: input.driverEmail,
        name: input.driverName,
        title,
        body: driverBody,
        ...(input.organisationName !== undefined
          ? { organisationName: input.organisationName }
          : {}),
        actionUrl: '/driver-self-service',
      });
    }

    return { created };
  }

  async syncAllTenantMaintenanceReminders(): Promise<{ created: number }> {
    const tenantIds = await this.prisma.vehicleMaintenanceSchedule.findMany({
      where: { isActive: true },
      distinct: ['tenantId'],
      select: { tenantId: true },
    });

    let created = 0;
    for (const item of tenantIds) {
      const result = await this.syncTenantMaintenanceReminders(item.tenantId);
      created += result.created;
    }
    return { created };
  }

  async syncAllTenantOperationalReminders(): Promise<{ created: number }> {
    const [remittance, maintenance] = await Promise.all([
      this.syncAllTenantRemittanceReminders(),
      this.syncAllTenantMaintenanceReminders(),
    ]);

    return { created: remittance.created + maintenance.created };
  }
}
