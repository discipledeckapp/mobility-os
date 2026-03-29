import { ApiProperty } from '@nestjs/swagger';

class GovernanceTenantPrivacySummaryDto {
  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  openRequests!: number;

  @ApiProperty()
  pendingReviewRequests!: number;

  @ApiProperty()
  closedRequests!: number;

  @ApiProperty()
  consentEventsLast30Days!: number;

  @ApiProperty({ required: false, nullable: true })
  lastRequestAt!: string | null;

  @ApiProperty({ required: false, nullable: true })
  lastConsentAt!: string | null;
}

class GovernancePrivacyRequestDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty({ required: false, nullable: true })
  userId!: string | null;

  @ApiProperty()
  subjectType!: string;

  @ApiProperty({ required: false, nullable: true })
  subjectId!: string | null;

  @ApiProperty()
  requestType!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty({ required: false, nullable: true })
  contactEmail!: string | null;

  @ApiProperty({ required: false, nullable: true })
  details!: string | null;

  @ApiProperty({ required: false, nullable: true })
  resolutionNotes!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

class GovernanceConsentEventDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty({ required: false, nullable: true })
  userId!: string | null;

  @ApiProperty()
  subjectType!: string;

  @ApiProperty({ required: false, nullable: true })
  subjectId!: string | null;

  @ApiProperty()
  policyDocument!: string;

  @ApiProperty()
  policyVersion!: string;

  @ApiProperty()
  consentScope!: string;

  @ApiProperty()
  granted!: boolean;

  @ApiProperty()
  grantedAt!: string;
}

class GovernancePrivacyTotalsDto {
  @ApiProperty()
  openRequests!: number;

  @ApiProperty()
  pendingReviewRequests!: number;

  @ApiProperty()
  closedRequests!: number;

  @ApiProperty()
  consentEventsLast30Days!: number;

  @ApiProperty()
  tenantsWithOpenPrivacyRequests!: number;
}

class GovernancePrivacySupportDto {
  @ApiProperty()
  supportEmail!: string;

  @ApiProperty({ required: false, nullable: true })
  supportPhonePrimary!: string | null;

  @ApiProperty({ required: false, nullable: true })
  supportPhoneSecondary!: string | null;

  @ApiProperty()
  privacyPolicyVersion!: string;

  @ApiProperty()
  termsVersion!: string;
}

export class GovernancePrivacyOverviewDto {
  @ApiProperty()
  generatedAt!: string;

  @ApiProperty({ type: GovernancePrivacyTotalsDto })
  totals!: GovernancePrivacyTotalsDto;

  @ApiProperty({ type: [GovernanceTenantPrivacySummaryDto] })
  tenantSummaries!: GovernanceTenantPrivacySummaryDto[];

  @ApiProperty({ type: [GovernancePrivacyRequestDto] })
  requests!: GovernancePrivacyRequestDto[];

  @ApiProperty({ type: [GovernanceConsentEventDto] })
  consents!: GovernanceConsentEventDto[];

  @ApiProperty({ type: GovernancePrivacySupportDto })
  support!: GovernancePrivacySupportDto;
}

class GovernanceTenantNotificationSummaryDto {
  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  notificationsLast30Days!: number;

  @ApiProperty()
  unreadNotifications!: number;

  @ApiProperty()
  pushDevices!: number;

  @ApiProperty()
  pushEnabledUsers!: number;

  @ApiProperty({ required: false, nullable: true })
  lastNotificationAt!: string | null;
}

class GovernanceNotificationItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  topic!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  body!: string;

  @ApiProperty({ required: false, nullable: true })
  actionUrl!: string | null;

  @ApiProperty({ required: false, nullable: true })
  readAt!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty({
    required: false,
    nullable: true,
    type: Object,
    additionalProperties: true,
  })
  user!: { name: string | null; email: string | null } | null;
}

class GovernanceNotificationTotalsDto {
  @ApiProperty()
  notificationsLast30Days!: number;

  @ApiProperty()
  unreadNotifications!: number;

  @ApiProperty()
  pushDevices!: number;

  @ApiProperty()
  pushEnabledUsers!: number;

  @ApiProperty()
  tenantsWithUnreadNotifications!: number;

  @ApiProperty()
  verificationNotifications!: number;

  @ApiProperty()
  remittanceNotifications!: number;

  @ApiProperty()
  assignmentNotifications!: number;

  @ApiProperty()
  complianceRiskNotifications!: number;
}

export class GovernanceNotificationsOverviewDto {
  @ApiProperty()
  generatedAt!: string;

  @ApiProperty({ type: GovernanceNotificationTotalsDto })
  totals!: GovernanceNotificationTotalsDto;

  @ApiProperty({ type: [GovernanceTenantNotificationSummaryDto] })
  tenantSummaries!: GovernanceTenantNotificationSummaryDto[];

  @ApiProperty({ type: [GovernanceNotificationItemDto] })
  notifications!: GovernanceNotificationItemDto[];
}

export class GovernanceOverviewDto {
  @ApiProperty()
  generatedAt!: string;

  @ApiProperty({ type: GovernancePrivacyOverviewDto })
  privacy!: GovernancePrivacyOverviewDto;

  @ApiProperty({ type: GovernanceNotificationsOverviewDto })
  notifications!: GovernanceNotificationsOverviewDto;
}
