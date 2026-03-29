import { Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ConfigService } from '@nestjs/config';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ZeptoMailService } from './zeptomail.service';

interface BrandContext {
  supportEmail: string;
  supportPhonePrimary: string;
  supportPhoneSecondary: string;
  socialHandle: string;
  websiteUrl: string;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// Inline SVG logo mark — matches the console brand square
const LOGO_MARK_SVG = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;"><rect width="32" height="32" rx="8" fill="#2563eb"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="14" font-weight="700" fill="#ffffff" letter-spacing="-0.5">M</text></svg>`;

function renderAuthEmailShell(
  title: string,
  eyebrow: string,
  intro: string,
  body: string,
  ctaLabel: string | null,
  ctaHref: string | null,
  brand: BrandContext,
): string {
  const cta =
    ctaLabel && ctaHref
      ? `<div style="margin-top:28px;"><a href="${ctaHref}" style="display:inline-block;border-radius:10px;background:#2563eb;color:#ffffff;text-decoration:none;padding:13px 22px;font-size:14px;font-weight:700;letter-spacing:-0.01em;box-shadow:0 8px 20px -6px rgba(37,99,235,0.55);">${ctaLabel}</a></div>`
      : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f1f5f9;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0;background:#ffffff;box-shadow:0 4px 24px -8px rgba(15,23,42,0.12);">

        <!-- Header bar -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e3a8a 0%,#2563eb 60%,#3b82f6 100%);padding:24px 32px;">
            <table cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="padding-right:12px;vertical-align:middle;">${LOGO_MARK_SVG}</td>
                <td style="vertical-align:middle;">
                  <div style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;line-height:1;">Mobiris Fleet OS</div>
                  <div style="font-size:10px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:rgba(219,234,254,0.6);margin-top:2px;">Fleet & Driver Operations Platform</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Content header -->
        <tr>
          <td style="padding:32px 32px 0;background:linear-gradient(180deg,#f8fbff 0%,#ffffff 100%);">
            <div style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#2563eb;">${eyebrow}</div>
            <h1 style="margin:10px 0 0;font-size:26px;line-height:1.25;font-weight:700;color:#020617;letter-spacing:-0.02em;">${title}</h1>
            <p style="margin:12px 0 0;font-size:15px;line-height:1.7;color:#475569;">${intro}</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:28px 32px 0;">
            ${body}
            ${cta}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:28px 32px 32px;">
            <div style="border-top:1px solid #e2e8f0;padding-top:20px;font-size:12px;line-height:1.8;color:#94a3b8;">
              <div>Need help? <a href="mailto:${brand.supportEmail}" style="color:#2563eb;text-decoration:none;font-weight:600;">${brand.supportEmail}</a> · ${brand.supportPhonePrimary}</div>
              <div style="margin-top:4px;"><a href="${brand.websiteUrl}" style="color:#64748b;text-decoration:none;">${brand.websiteUrl}</a> &nbsp;·&nbsp; ${brand.socialHandle}</div>
              <div style="margin-top:12px;font-size:11px;color:#cbd5e1;">You received this email because an action was taken on your Mobiris Fleet OS account. If you did not initiate this, contact support immediately.</div>
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
export class AuthEmailService {
  constructor(
    private readonly config: ConfigService,
    private readonly mailer: ZeptoMailService,
  ) {}

  private getBrandContext(): BrandContext {
    return {
      supportEmail: this.config.getOrThrow<string>('SUPPORT_EMAIL'),
      supportPhonePrimary: this.config.getOrThrow<string>('SUPPORT_PHONE_PRIMARY'),
      supportPhoneSecondary: this.config.getOrThrow<string>('SUPPORT_PHONE_SECONDARY'),
      socialHandle: this.config.getOrThrow<string>('SOCIAL_HANDLE'),
      websiteUrl: this.config.getOrThrow<string>('WEBSITE_URL'),
    };
  }

  async sendOnboardingEmail(input: {
    email: string;
    name: string;
    loginUrl: string;
    verificationCode: string;
  }): Promise<void> {
    const brand = this.getBrandContext();
    const html = renderAuthEmailShell(
      'Welcome to Mobiris Fleet OS',
      'Tenant Access',
      'Your tenant account is ready. Use the verification code below to validate the account and continue securely.',
      `
        <div style="border:1px solid #dbeafe;border-radius:16px;background:#eff6ff;padding:20px;">
          <div style="font-size:13px;font-weight:600;color:#1d4ed8;text-transform:uppercase;letter-spacing:0.08em;">Verification code</div>
          <div style="margin-top:10px;font-size:32px;font-weight:700;letter-spacing:0.24em;color:#0f172a;">${input.verificationCode}</div>
          <div style="margin-top:10px;font-size:14px;line-height:1.6;color:#475569;">This code is valid for 15 minutes.</div>
        </div>
        <p style="margin:24px 0 0;font-size:15px;line-height:1.7;color:#334155;">Hi ${input.name}, once your account is verified, sign in to manage your drivers, vehicles, assignments, and remittance workflows in one place.</p>
      `,
      'Go to tenant login',
      input.loginUrl,
      brand,
    );

    await this.mailer.sendEmail({
      to: [{ address: input.email, name: input.name }],
      subject: 'Welcome to Mobiris Fleet OS',
      htmlBody: html,
    });
  }

  async sendPasswordResetEmail(input: {
    email: string;
    name: string;
    resetUrl: string;
    resetToken: string;
  }): Promise<void> {
    const brand = this.getBrandContext();
    const html = renderAuthEmailShell(
      'Reset your Mobiris Fleet OS password',
      'Account Security',
      'We received a request to reset your password. Use the secure link below or the reset token if you are completing the flow manually.',
      `
        <div style="border:1px solid #e2e8f0;border-radius:16px;background:#f8fafc;padding:20px;">
          <div style="font-size:13px;font-weight:600;color:#334155;text-transform:uppercase;letter-spacing:0.08em;">Reset token</div>
          <div style="margin-top:10px;font-size:15px;font-weight:600;color:#0f172a;word-break:break-all;">${input.resetToken}</div>
          <div style="margin-top:10px;font-size:14px;line-height:1.6;color:#475569;">This token expires in 30 minutes. If you did not request this, ignore this email and contact support.</div>
        </div>
        <p style="margin:24px 0 0;font-size:15px;line-height:1.7;color:#334155;">Hi ${input.name}, keeping your tenant account secure matters. Once your password is updated, any new sign-in should use the new password immediately.</p>
      `,
      'Reset password',
      input.resetUrl,
      brand,
    );

    await this.mailer.sendEmail({
      to: [{ address: input.email, name: input.name }],
      subject: 'Reset your Mobiris Fleet OS password',
      htmlBody: html,
    });
  }

  async sendAccountVerificationOtpEmail(input: {
    email: string;
    name: string;
    code: string;
  }): Promise<void> {
    const brand = this.getBrandContext();
    const html = renderAuthEmailShell(
      'Verify your Mobiris Fleet OS account',
      'Account Verification',
      'Use the verification code below to confirm that this email address belongs to you.',
      `
        <div style="border:1px solid #dbeafe;border-radius:16px;background:#eff6ff;padding:20px;">
          <div style="font-size:13px;font-weight:600;color:#1d4ed8;text-transform:uppercase;letter-spacing:0.08em;">One-time passcode</div>
          <div style="margin-top:10px;font-size:32px;font-weight:700;letter-spacing:0.24em;color:#0f172a;">${input.code}</div>
          <div style="margin-top:10px;font-size:14px;line-height:1.6;color:#475569;">This code expires in 15 minutes.</div>
        </div>
        <p style="margin:24px 0 0;font-size:15px;line-height:1.7;color:#334155;">Hi ${input.name}, if you did not request this verification code, ignore this email and contact support.</p>
      `,
      null,
      null,
      brand,
    );

    await this.mailer.sendEmail({
      to: [{ address: input.email, name: input.name }],
      subject: 'Verify your Mobiris Fleet OS account',
      htmlBody: html,
    });
  }

  async sendOrgSignupOtpEmail(input: {
    email: string;
    name: string;
    orgName: string;
    code: string;
  }): Promise<void> {
    const brand = this.getBrandContext();
    const html = renderAuthEmailShell(
      'Verify your email address',
      'Organisation Registration',
      `You're almost set up on Mobiris Fleet OS. Enter the verification code below to confirm your email and activate your fleet account.`,
      `
        <div style="border-radius:16px;background:linear-gradient(180deg,#eff6ff,#dbeafe 100%);border:1px solid #bfdbfe;padding:24px;">
          <div style="font-size:11px;font-weight:700;color:#1d4ed8;text-transform:uppercase;letter-spacing:0.12em;">One-time passcode</div>
          <div style="margin-top:12px;font-size:40px;font-weight:800;letter-spacing:0.3em;color:#0f172a;font-variant-numeric:tabular-nums;">${input.code}</div>
          <div style="margin-top:12px;font-size:13px;line-height:1.6;color:#475569;">Valid for <strong>15 minutes</strong>. Do not share this code with anyone.</div>
        </div>
        <p style="margin:24px 0 0;font-size:14px;line-height:1.7;color:#334155;">Hi ${input.name}, you are registering <strong>${input.orgName}</strong> on Mobiris Fleet OS. Once verified you can start adding drivers, vehicles, and assignments straight away.</p>
      `,
      null,
      null,
      brand,
    );

    await this.mailer.sendEmail({
      to: [{ address: input.email, name: input.name }],
      subject: `${input.code} is your Mobiris Fleet OS verification code`,
      htmlBody: html,
    });
  }

  async sendOrgWelcomeEmail(input: {
    email: string;
    name: string;
    orgName: string;
    loginUrl: string;
  }): Promise<void> {
    const brand = this.getBrandContext();
    const html = renderAuthEmailShell(
      `Welcome to Mobiris Fleet OS, ${input.orgName}`,
      "You're all set",
      'Your organisation account is active. Sign in to Mobiris Fleet OS to get started.',
      `
        <div style="border-radius:16px;border:1px solid #e2e8f0;background:#f8fbff;padding:20px 24px;">
          <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.12em;">Your organisation</div>
          <div style="margin-top:8px;font-size:22px;font-weight:700;color:#0f172a;letter-spacing:-0.01em;">${input.orgName}</div>
        </div>
        <div style="margin-top:24px;">
          <div style="font-size:13px;font-weight:700;color:#0f172a;margin-bottom:12px;">Quick-start checklist</div>
          <table cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
            ${[
              ['Add your first driver', 'Name, phone, and fleet assignment'],
              ['Register a vehicle', 'Plate number and vehicle type'],
              ['Create an assignment', 'Link a driver to a vehicle'],
              ['Record remittance', 'Track daily collections'],
            ]
              .map(
                ([step, desc]) => `
            <tr>
              <td style="padding:8px 0;vertical-align:top;width:24px;">
                <div style="width:18px;height:18px;border-radius:50%;background:#dbeafe;display:flex;align-items:center;justify-content:center;">
                  <div style="width:6px;height:6px;border-radius:50%;background:#2563eb;margin:auto;"></div>
                </div>
              </td>
              <td style="padding:8px 0 8px 10px;">
                <div style="font-size:13px;font-weight:600;color:#0f172a;">${step}</div>
                <div style="font-size:12px;color:#64748b;margin-top:2px;">${desc}</div>
              </td>
            </tr>`,
              )
              .join('')}
          </table>
        </div>
        <p style="margin:20px 0 0;font-size:14px;line-height:1.7;color:#334155;">Hi ${input.name}, your account is ready. The link below takes you straight to the fleet console.</p>
      `,
      'Open fleet console',
      input.loginUrl,
      brand,
    );

    await this.mailer.sendEmail({
      to: [{ address: input.email, name: input.name }],
      subject: `Your Mobiris Fleet OS account is ready — ${input.orgName}`,
      htmlBody: html,
    });
  }

  async sendDriverSelfServiceVerificationEmail(input: {
    email: string;
    name: string;
    driverName: string;
    organisationName?: string | null;
    verificationUrl: string;
    otpCode?: string;
  }): Promise<void> {
    const brand = this.getBrandContext();
    const organisationName = input.organisationName?.trim() || 'your organisation';
    const otpBlock = input.otpCode
      ? `
        <div style="margin-top:16px;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;background:#f8fafc;text-align:center;">
          <div style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.12em;">Or enter this code in Mobiris Fleet OS</div>
          <div style="margin-top:10px;font-size:36px;font-weight:700;letter-spacing:0.2em;color:#0f172a;font-family:'Courier New',Courier,monospace;">${input.otpCode}</div>
          <div style="margin-top:6px;font-size:12px;color:#94a3b8;">Code expires in 48 hours</div>
        </div>`
      : '';

    const html = renderAuthEmailShell(
      `Complete your verification for ${escapeHtml(organisationName)}`,
      'Driver Verification',
      `${escapeHtml(organisationName)} has requested a self-service identity verification step. Open the secure link below to complete your live selfie and identity submission.`,
      `
        <div style="border:1px solid #dbeafe;border-radius:16px;background:#eff6ff;padding:20px;">
          <div style="font-size:13px;font-weight:600;color:#1d4ed8;text-transform:uppercase;letter-spacing:0.08em;">Organisation</div>
          <div style="margin-top:10px;font-size:18px;font-weight:700;color:#0f172a;">${escapeHtml(organisationName)}</div>
          <div style="margin-top:14px;font-size:13px;font-weight:600;color:#1d4ed8;text-transform:uppercase;letter-spacing:0.08em;">Driver</div>
          <div style="margin-top:10px;font-size:22px;font-weight:700;color:#0f172a;">${input.driverName}</div>
          <div style="margin-top:10px;font-size:14px;line-height:1.6;color:#475569;">Use the secure link below on the device that will capture the live selfie.</div>
        </div>
        ${otpBlock}
        <p style="margin:24px 0 0;font-size:15px;line-height:1.7;color:#334155;">Hi ${input.name}, if anything here is unclear, contact ${escapeHtml(organisationName)} before proceeding. If you were not expecting this request, ignore this email and contact the organisation team.</p>
      `,
      'Start self-service verification',
      input.verificationUrl,
      brand,
    );

    await this.mailer.sendEmail({
      to: [{ address: input.email, name: input.name }],
      subject: `${organisationName}: complete your driver verification`,
      htmlBody: html,
    });
  }

  async sendGuarantorSelfServiceVerificationEmail(input: {
    email: string;
    guarantorName: string;
    driverName: string;
    organisationName?: string | null;
    verificationUrl: string;
    otpCode?: string;
  }): Promise<void> {
    const brand = this.getBrandContext();
    const organisationName = input.organisationName?.trim() || 'the organisation';
    const otpBlock = input.otpCode
      ? `
        <div style="margin-top:16px;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;background:#f8fafc;text-align:center;">
          <div style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.12em;">Or enter this code in Mobiris Fleet OS</div>
          <div style="margin-top:10px;font-size:36px;font-weight:700;letter-spacing:0.2em;color:#0f172a;font-family:'Courier New',Courier,monospace;">${input.otpCode}</div>
          <div style="margin-top:6px;font-size:12px;color:#94a3b8;">Code expires in 48 hours</div>
        </div>`
      : '';

    const html = renderAuthEmailShell(
      `${escapeHtml(organisationName)} guarantor verification`,
      'Guarantor Verification',
      `You have been named as a guarantor for ${input.driverName} by ${escapeHtml(organisationName)}. Please complete your identity verification to confirm your role.`,
      `
        <div style="border:1px solid #fde68a;border-radius:16px;background:#fffbeb;padding:20px;">
          <div style="font-size:13px;font-weight:600;color:#b45309;text-transform:uppercase;letter-spacing:0.08em;">Organisation</div>
          <div style="margin-top:10px;font-size:18px;font-weight:700;color:#0f172a;">${escapeHtml(organisationName)}</div>
          <div style="margin-top:14px;font-size:13px;font-weight:600;color:#b45309;text-transform:uppercase;letter-spacing:0.08em;">Driver you are guaranteeing</div>
          <div style="margin-top:10px;font-size:22px;font-weight:700;color:#0f172a;">${input.driverName}</div>
          <div style="margin-top:10px;font-size:14px;line-height:1.6;color:#475569;">Use the secure link below on the device that will capture the live selfie. Once complete, the operator will be notified.</div>
        </div>
        ${otpBlock}
        <p style="margin:24px 0 0;font-size:15px;line-height:1.7;color:#334155;">Hi ${input.guarantorName}, if you were not expecting this request, please ignore this email or contact ${escapeHtml(organisationName)} directly.</p>
      `,
      'Start guarantor verification',
      input.verificationUrl,
      brand,
    );

    await this.mailer.sendEmail({
      to: [{ address: input.email, name: input.guarantorName }],
      subject: `${organisationName}: guarantor verification for ${input.driverName}`,
      htmlBody: html,
    });
  }
}
