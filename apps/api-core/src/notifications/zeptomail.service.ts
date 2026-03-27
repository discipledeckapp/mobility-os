import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ConfigService } from '@nestjs/config';

interface ZeptoMailRecipient {
  address: string;
  name?: string;
}

function maskEmailAddress(email: string): string {
  const [localPart = '', domainPart = ''] = email.trim().split('@');
  if (!localPart || !domainPart) {
    return 'redacted';
  }
  const visiblePrefix = localPart.slice(0, 2);
  return `${visiblePrefix}${'•'.repeat(Math.max(localPart.length - visiblePrefix.length, 1))}@${domainPart}`;
}

export interface SendEmailInput {
  to: ZeptoMailRecipient[];
  subject: string;
  htmlBody: string;
}

@Injectable()
export class ZeptoMailService {
  private readonly logger = new Logger(ZeptoMailService.name);

  constructor(private readonly config: ConfigService) {}

  async sendEmail(input: SendEmailInput): Promise<void> {
    const apiKey = this.config.get<string>('ZEPTOMAIL_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        `Email delivery is unavailable because ZEPTOMAIL_API_KEY is not configured. Subject: ${input.subject}`,
      );
      throw new ServiceUnavailableException(
        'Email delivery is not configured yet. Add ZEPTOMAIL_API_KEY before sending self-service links.',
      );
    }

    const fromAddress = this.config.getOrThrow<string>('EMAIL_FROM_ADDRESS');
    const fromName = this.config.getOrThrow<string>('EMAIL_FROM_NAME');
    const apiUrl = this.config.getOrThrow<string>('ZEPTOMAIL_API_URL');

    this.logger.log(
      `Sending email → to=${input.to.map((r) => maskEmailAddress(r.address)).join(',')} subject="${input.subject}" from=${fromAddress}`,
    );

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Zoho-enczapikey ${apiKey}`,
      },
      body: JSON.stringify({
        from: { address: fromAddress, name: fromName },
        to: input.to.map((recipient) => ({
          email_address: {
            address: recipient.address,
            ...(recipient.name ? { name: recipient.name } : {}),
          },
        })),
        subject: input.subject,
        htmlbody: input.htmlBody,
      }),
    });

    const responseBody = await response.text();

    if (!response.ok) {
      this.logger.error(`ZeptoMail error — status=${response.status} body=[redacted]`);
      throw new Error(
        `ZeptoMail returned status ${response.status}: ${responseBody ? 'provider error' : 'unknown error'}`,
      );
    }

    this.logger.log(`ZeptoMail accepted — status=${response.status}`);
  }
}
