import { Logger, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, type User, type UserNotification, type UserPushDevice } from '@prisma/client';
import { TenantRole } from '@mobility-os/authz-model';
import { PrismaService } from '../database/prisma.service';
import { getDefaultLanguageForCountry, readOrganisationSettings } from '../tenants/tenant-settings';
import {
  NOTIFICATION_TOPICS,
  type NotificationPreferenceMap,
  type NotificationTopic,
  readUserSettings,
  writeUserSettings,
} from '../auth/user-settings';
import { ZeptoMailService } from './zeptomail.service';

type NotificationRecipient = Pick<
  User,
  'id' | 'tenantId' | 'email' | 'name' | 'role' | 'driverId' | 'settings'
>;

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
      void this.syncAllTenantRemittanceReminders().catch((error: unknown) => {
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
    actionUrl?: string | null;
  }) {
    const actionMarkup = input.actionUrl
      ? `<p style="margin-top:20px;"><a href="${input.actionUrl}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:700;">Open Mobiris</a></p>`
      : '';

    return `
      <div style="font-family:Inter,Segoe UI,Arial,sans-serif;background:#f8fafc;padding:24px;color:#0f172a;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;padding:28px;">
          <div style="font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#2563eb;">Mobiris notification</div>
          <h1 style="margin:12px 0 0;font-size:24px;line-height:1.2;">${input.title}</h1>
          <p style="margin:16px 0 0;font-size:15px;line-height:1.7;color:#334155;">Hello ${input.recipientName}, ${input.body}</p>
          ${actionMarkup}
          <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#64748b;">Need help? Contact ${this.getSupportEmail()}.</p>
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
      .filter((token) => token.startsWith('ExponentPushToken[') || token.startsWith('ExpoPushToken['));

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

  async createNotificationForUser(
    user: NotificationRecipient,
    payload: NotificationPayload,
    options: { tenantCountry?: string | null; dedupeWithinHours?: number } = {},
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
                actionUrl: payload.actionUrl,
              }
            : {
                recipientName: user.name,
                title: payload.title,
                body: payload.body,
              };
        await this.mailer.sendEmail({
          to: [{ address: user.email, name: user.name }],
          subject: payload.title,
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

  async markRead(tenantId: string, userId: string, notificationId: string): Promise<UserNotification> {
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

  async getPreferences(
    tenantId: string,
    userId: string,
  ): Promise<NotificationPreferenceMap> {
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
    nextPreferences: Partial<Record<NotificationTopic, Partial<NotificationPreferenceMap[NotificationTopic]>>>,
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

  private async getReminderRecipients(tenantId: string, driverId: string) {
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
          driverId,
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

    return [...operatorUsers, ...linkedDriverUsers];
  }

  private async createDirectDriverEmailNotification(input: {
    email: string;
    name: string;
    title: string;
    body: string;
    actionUrl?: string | null;
  }) {
    try {
      const emailShellInput =
        input.actionUrl !== undefined
          ? {
              recipientName: input.name,
              title: input.title,
              body: input.body,
              actionUrl: input.actionUrl,
            }
          : {
              recipientName: input.name,
              title: input.title,
              body: input.body,
            };
      await this.mailer.sendEmail({
        to: [{ address: input.email, name: input.name }],
        subject: input.title,
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
        readOrganisationSettings(tenant.metadata, tenant.country).branding.displayName ?? tenant.name;
      const driverFullName = `${driver.firstName} ${driver.lastName}`.trim();
      const recipients = await this.getReminderRecipients(tenantId, remittance.driverId);
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
          { tenantCountry: tenant.country },
        );
        if (notification) {
          created += 1;
        }
      }

      if (driver.email && recipients.every((recipient) => recipient.driverId !== remittance.driverId)) {
        await this.createDirectDriverEmailNotification({
          email: driver.email,
          name: driverFullName,
          title,
          body,
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
}
