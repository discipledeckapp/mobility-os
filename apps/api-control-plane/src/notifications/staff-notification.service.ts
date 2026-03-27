import { Injectable, Logger } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ConfigService } from '@nestjs/config';

const LOGO_MARK_SVG = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;"><rect width="32" height="32" rx="8" fill="#2563eb"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="14" font-weight="700" fill="#ffffff" letter-spacing="-0.5">M</text></svg>`;

function renderAdminEmailShell(title: string, bodyHtml: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f1f5f9;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0;background:#ffffff;box-shadow:0 4px 24px -8px rgba(15,23,42,0.12);">
        <tr>
          <td style="background:linear-gradient(135deg,#1e3a8a 0%,#2563eb 60%,#3b82f6 100%);padding:24px 32px;">
            <table cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="padding-right:12px;vertical-align:middle;">${LOGO_MARK_SVG}</td>
                <td style="vertical-align:middle;">
                  <div style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;line-height:1;">Mobiris</div>
                  <div style="font-size:10px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:rgba(219,234,254,0.6);margin-top:2px;">Platform Alerts</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 32px 0;background:linear-gradient(180deg,#f8fbff 0%,#ffffff 100%);">
            <div style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#2563eb;">Admin Notification</div>
            <h1 style="margin:10px 0 0;font-size:24px;line-height:1.25;font-weight:700;color:#020617;letter-spacing:-0.02em;">${title}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px 32px;">
            ${bodyHtml}
            <div style="margin-top:28px;border-top:1px solid #e2e8f0;padding-top:16px;font-size:12px;color:#94a3b8;">
              This is an automated alert from the Mobiris control plane. Do not reply to this email.
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim();
}

@Injectable()
export class StaffNotificationService {
  private readonly logger = new Logger(StaffNotificationService.name);

  constructor(private readonly config: ConfigService) {}

  async notifyNewTenantProvisioned(input: {
    tenantName: string;
    tenantSlug: string;
    tenantCountry: string;
    operatorEmail: string;
    planName: string;
    provisionedAt: Date;
  }): Promise<void> {
    const bodyHtml = `
      <div style="border:1px solid #dbeafe;border-radius:16px;background:#eff6ff;padding:20px 24px;margin-bottom:20px;">
        <div style="font-size:11px;font-weight:700;color:#1d4ed8;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">New organisation</div>
        <table cellpadding="0" cellspacing="0" role="presentation" style="width:100%;font-size:14px;line-height:2;">
          <tr><td style="color:#64748b;width:140px;">Organisation</td><td style="font-weight:600;color:#0f172a;">${input.tenantName}</td></tr>
          <tr><td style="color:#64748b;">Slug</td><td style="color:#0f172a;">${input.tenantSlug}</td></tr>
          <tr><td style="color:#64748b;">Country</td><td style="color:#0f172a;">${input.tenantCountry}</td></tr>
          <tr><td style="color:#64748b;">Operator email</td><td style="color:#0f172a;">${input.operatorEmail}</td></tr>
          <tr><td style="color:#64748b;">Plan</td><td style="color:#0f172a;">${input.planName}</td></tr>
          <tr><td style="color:#64748b;">Provisioned at</td><td style="color:#0f172a;">${input.provisionedAt.toISOString()}</td></tr>
        </table>
      </div>
      <p style="margin:0;font-size:14px;line-height:1.7;color:#334155;">A new organisation has been provisioned on Mobiris and their account is now active. Review the tenant in the control plane if any manual follow-up is required.</p>
    `;

    await this.sendAdminEmail(
      `New organisation signed up: ${input.tenantName}`,
      renderAdminEmailShell(`New sign-up: ${input.tenantName}`, bodyHtml),
    );
  }

  async notifySubscriptionTierUpgraded(input: {
    tenantId: string;
    tenantName?: string;
    fromPlanName: string;
    toPlanName: string;
    upgradedAt: Date;
  }): Promise<void> {
    const name = input.tenantName ?? input.tenantId;
    const bodyHtml = `
      <div style="border:1px solid #d1fae5;border-radius:16px;background:#ecfdf5;padding:20px 24px;margin-bottom:20px;">
        <div style="font-size:11px;font-weight:700;color:#065f46;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">Plan change</div>
        <table cellpadding="0" cellspacing="0" role="presentation" style="width:100%;font-size:14px;line-height:2;">
          <tr><td style="color:#64748b;width:140px;">Organisation</td><td style="font-weight:600;color:#0f172a;">${name}</td></tr>
          <tr><td style="color:#64748b;">Tenant ID</td><td style="color:#0f172a;">${input.tenantId}</td></tr>
          <tr><td style="color:#64748b;">Previous plan</td><td style="color:#0f172a;">${input.fromPlanName}</td></tr>
          <tr><td style="color:#64748b;">New plan</td><td style="font-weight:700;color:#059669;">${input.toPlanName}</td></tr>
          <tr><td style="color:#64748b;">Changed at</td><td style="color:#0f172a;">${input.upgradedAt.toISOString()}</td></tr>
        </table>
      </div>
      <p style="margin:0;font-size:14px;line-height:1.7;color:#334155;">A tenant has changed their subscription plan. Review the tenant in the control plane to ensure billing and feature entitlements are correctly applied.</p>
    `;

    await this.sendAdminEmail(
      `Plan change: ${name} → ${input.toPlanName}`,
      renderAdminEmailShell(`Plan change: ${name}`, bodyHtml),
    );
  }

  async sendPlatformStaffInvitation(input: {
    name: string;
    email: string;
    role: string;
    invitationUrl: string;
    expiresAt: Date;
  }): Promise<void> {
    const apiKey = this.config.get<string>('ZEPTOMAIL_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        `Skipping staff invitation email — ZEPTOMAIL_API_KEY is not set. Invite for ${input.email}`,
      );
      return;
    }

    const fromAddress = this.config.get<string>('EMAIL_FROM_ADDRESS') ?? 'noreply@mobiris.ng';
    const fromName = this.config.get<string>('EMAIL_FROM_NAME') ?? 'Mobiris';
    const apiUrl =
      this.config.get<string>('ZEPTOMAIL_API_URL') ?? 'https://api.zeptomail.com/v1.1/email';

    const subject = 'Complete your Mobiris platform staff setup';
    const htmlBody = renderAdminEmailShell(
      'Set up your Mobiris staff account',
      `
        <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#334155;">Hello ${input.name}, you have been invited to the Mobility OS control plane as <strong>${input.role}</strong>.</p>
        <div style="border:1px solid #dbeafe;border-radius:16px;background:#eff6ff;padding:20px 24px;margin-bottom:20px;">
          <div style="font-size:11px;font-weight:700;color:#1d4ed8;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">Invitation</div>
          <p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#0f172a;">Use the secure link below to set your password and activate your platform staff account.</p>
          <a href="${input.invitationUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 18px;border-radius:12px;">Accept invitation</a>
          <p style="margin:12px 0 0;font-size:12px;line-height:1.6;color:#64748b;">This invitation expires on ${input.expiresAt.toISOString()}.</p>
        </div>
      `,
    );

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Zoho-enczapikey ${apiKey}`,
        },
        body: JSON.stringify({
          from: { address: fromAddress, name: fromName },
          to: [{ email_address: { address: input.email, name: input.name } }],
          subject,
          htmlbody: htmlBody,
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        this.logger.error(
          `Staff invitation email failed — status=${response.status} body=${body}`,
        );
      } else {
        this.logger.log(`Staff invitation sent — email=${input.email}`);
      }
    } catch (error) {
      this.logger.error(
        `Staff invitation email threw — ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async sendPlatformPasswordReset(input: {
    name: string;
    email: string;
    resetUrl: string;
    expiresAt: Date;
  }): Promise<void> {
    const apiKey = this.config.get<string>('ZEPTOMAIL_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        `Skipping platform password reset email — ZEPTOMAIL_API_KEY is not set. Reset for ${input.email}`,
      );
      return;
    }

    const fromAddress = this.config.get<string>('EMAIL_FROM_ADDRESS') ?? 'noreply@mobiris.ng';
    const fromName = this.config.get<string>('EMAIL_FROM_NAME') ?? 'Mobiris';
    const apiUrl =
      this.config.get<string>('ZEPTOMAIL_API_URL') ?? 'https://api.zeptomail.com/v1.1/email';

    const subject = 'Reset your Mobiris control-plane password';
    const htmlBody = renderAdminEmailShell(
      'Reset your staff password',
      `
        <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#334155;">Hello ${input.name}, use the secure link below to reset your Mobility OS control-plane password.</p>
        <div style="border:1px solid #dbeafe;border-radius:16px;background:#eff6ff;padding:20px 24px;margin-bottom:20px;">
          <div style="font-size:11px;font-weight:700;color:#1d4ed8;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">Password recovery</div>
          <a href="${input.resetUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 18px;border-radius:12px;">Reset password</a>
          <p style="margin:12px 0 0;font-size:12px;line-height:1.6;color:#64748b;">This link expires on ${input.expiresAt.toISOString()}.</p>
        </div>
      `,
    );

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Zoho-enczapikey ${apiKey}`,
        },
        body: JSON.stringify({
          from: { address: fromAddress, name: fromName },
          to: [{ email_address: { address: input.email, name: input.name } }],
          subject,
          htmlbody: htmlBody,
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        this.logger.error(
          `Platform password reset email failed — status=${response.status} body=${body}`,
        );
      } else {
        this.logger.log(`Platform password reset sent — email=${input.email}`);
      }
    } catch (error) {
      this.logger.error(
        `Platform password reset email threw — ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async sendAdminEmail(subject: string, htmlBody: string): Promise<void> {
    const notificationEmail = this.config.get<string>('PLATFORM_ADMIN_NOTIFICATION_EMAIL');
    if (!notificationEmail) {
      this.logger.warn(
        `Skipping admin notification — PLATFORM_ADMIN_NOTIFICATION_EMAIL is not set. Subject: ${subject}`,
      );
      return;
    }

    const apiKey = this.config.get<string>('ZEPTOMAIL_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        `Skipping admin notification — ZEPTOMAIL_API_KEY is not set. Subject: ${subject}`,
      );
      return;
    }

    const fromAddress = this.config.get<string>('EMAIL_FROM_ADDRESS') ?? 'noreply@mobiris.ng';
    const fromName = this.config.get<string>('EMAIL_FROM_NAME') ?? 'Mobiris';
    const apiUrl =
      this.config.get<string>('ZEPTOMAIL_API_URL') ?? 'https://api.zeptomail.com/v1.1/email';

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Zoho-enczapikey ${apiKey}`,
        },
        body: JSON.stringify({
          from: { address: fromAddress, name: fromName },
          to: [{ email_address: { address: notificationEmail, name: 'Mobiris Admin' } }],
          subject,
          htmlbody: htmlBody,
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        this.logger.error(`Admin notification email failed — status=${response.status} body=${body}`);
      } else {
        this.logger.log(`Admin notification sent — subject="${subject}" to=${notificationEmail}`);
      }
    } catch (error) {
      this.logger.error(`Admin notification email threw — ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
