
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.CpPlatformUserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  name: 'name',
  role: 'role',
  passwordHash: 'passwordHash',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CpPlanScalarFieldEnum = {
  id: 'id',
  name: 'name',
  tier: 'tier',
  billingInterval: 'billingInterval',
  basePriceMinorUnits: 'basePriceMinorUnits',
  currency: 'currency',
  isActive: 'isActive',
  features: 'features',
  customTerms: 'customTerms',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CpSubscriptionScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  planId: 'planId',
  status: 'status',
  currentPeriodStart: 'currentPeriodStart',
  currentPeriodEnd: 'currentPeriodEnd',
  cancelAtPeriodEnd: 'cancelAtPeriodEnd',
  trialEndsAt: 'trialEndsAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CpInvoiceScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  subscriptionId: 'subscriptionId',
  status: 'status',
  amountDueMinorUnits: 'amountDueMinorUnits',
  amountPaidMinorUnits: 'amountPaidMinorUnits',
  currency: 'currency',
  periodStart: 'periodStart',
  periodEnd: 'periodEnd',
  dueAt: 'dueAt',
  paidAt: 'paidAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CpCollectionAttemptScalarFieldEnum = {
  id: 'id',
  invoiceId: 'invoiceId',
  tenantId: 'tenantId',
  subscriptionId: 'subscriptionId',
  kind: 'kind',
  status: 'status',
  channel: 'channel',
  provider: 'provider',
  paymentReference: 'paymentReference',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CpInvoiceLineItemScalarFieldEnum = {
  id: 'id',
  invoiceId: 'invoiceId',
  kind: 'kind',
  description: 'description',
  quantity: 'quantity',
  unitAmountMinorUnits: 'unitAmountMinorUnits',
  amountMinorUnits: 'amountMinorUnits',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.CpPlatformWalletScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  currency: 'currency',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CpWalletEntryScalarFieldEnum = {
  id: 'id',
  walletId: 'walletId',
  type: 'type',
  amountMinorUnits: 'amountMinorUnits',
  currency: 'currency',
  referenceId: 'referenceId',
  referenceType: 'referenceType',
  description: 'description',
  createdAt: 'createdAt'
};

exports.Prisma.CpBillingPaymentMethodScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  provider: 'provider',
  authorizationCodeCiphertext: 'authorizationCodeCiphertext',
  customerCodeCiphertext: 'customerCodeCiphertext',
  last4: 'last4',
  brand: 'brand',
  status: 'status',
  active: 'active',
  autopayEnabled: 'autopayEnabled',
  initialReference: 'initialReference',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CpPaymentAttemptScalarFieldEnum = {
  id: 'id',
  provider: 'provider',
  reference: 'reference',
  purpose: 'purpose',
  tenantId: 'tenantId',
  invoiceId: 'invoiceId',
  status: 'status',
  amountMinorUnits: 'amountMinorUnits',
  currency: 'currency',
  customerEmail: 'customerEmail',
  customerName: 'customerName',
  checkoutUrl: 'checkoutUrl',
  accessCode: 'accessCode',
  providerPayload: 'providerPayload',
  failureReason: 'failureReason',
  paidAt: 'paidAt',
  appliedAt: 'appliedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CpDisputeScalarFieldEnum = {
  id: 'id',
  disputeCode: 'disputeCode',
  tenantId: 'tenantId',
  disputeType: 'disputeType',
  relatedEntityType: 'relatedEntityType',
  relatedEntityId: 'relatedEntityId',
  claimantType: 'claimantType',
  claimantId: 'claimantId',
  respondentType: 'respondentType',
  respondentId: 'respondentId',
  title: 'title',
  reasonCode: 'reasonCode',
  narrative: 'narrative',
  status: 'status',
  priority: 'priority',
  assignedTo: 'assignedTo',
  resolvedAt: 'resolvedAt',
  resolvedByType: 'resolvedByType',
  resolvedById: 'resolvedById',
  resolutionSummary: 'resolutionSummary',
  finalAmountMinorUnits: 'finalAmountMinorUnits',
  currency: 'currency',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CpDisputeEvidenceScalarFieldEnum = {
  id: 'id',
  disputeId: 'disputeId',
  tenantId: 'tenantId',
  uploadedByType: 'uploadedByType',
  uploadedById: 'uploadedById',
  evidenceType: 'evidenceType',
  description: 'description',
  fileName: 'fileName',
  contentType: 'contentType',
  storageKey: 'storageKey',
  fileUrl: 'fileUrl',
  fileHash: 'fileHash',
  integrityHash: 'integrityHash',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.CpDisputeTimelineScalarFieldEnum = {
  id: 'id',
  disputeId: 'disputeId',
  tenantId: 'tenantId',
  actorType: 'actorType',
  actorId: 'actorId',
  actionType: 'actionType',
  message: 'message',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.CpEvidenceRecordScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  actorType: 'actorType',
  actorId: 'actorId',
  evidenceType: 'evidenceType',
  relatedEntityType: 'relatedEntityType',
  relatedEntityId: 'relatedEntityId',
  sourceEntityType: 'sourceEntityType',
  sourceEntityId: 'sourceEntityId',
  amountMinorUnits: 'amountMinorUnits',
  currency: 'currency',
  fileName: 'fileName',
  contentType: 'contentType',
  storageKey: 'storageKey',
  fileUrl: 'fileUrl',
  fileHash: 'fileHash',
  integrityHash: 'integrityHash',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.CpIssuedDocumentScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  documentNumber: 'documentNumber',
  documentType: 'documentType',
  status: 'status',
  issuerType: 'issuerType',
  issuerId: 'issuerId',
  recipientType: 'recipientType',
  recipientId: 'recipientId',
  relatedEntityType: 'relatedEntityType',
  relatedEntityId: 'relatedEntityId',
  supersededById: 'supersededById',
  version: 'version',
  fingerprint: 'fingerprint',
  signatureVersion: 'signatureVersion',
  signedAt: 'signedAt',
  signedBySystem: 'signedBySystem',
  verificationReference: 'verificationReference',
  fileName: 'fileName',
  contentType: 'contentType',
  storageKey: 'storageKey',
  fileUrl: 'fileUrl',
  fileHash: 'fileHash',
  canonicalPayload: 'canonicalPayload',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CpFeatureFlagScalarFieldEnum = {
  id: 'id',
  key: 'key',
  description: 'description',
  scope: 'scope',
  value: 'value',
  isEnabled: 'isEnabled',
  ownedBy: 'ownedBy',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CpFeatureFlagOverrideScalarFieldEnum = {
  id: 'id',
  flagId: 'flagId',
  tenantId: 'tenantId',
  countryCode: 'countryCode',
  planTier: 'planTier',
  value: 'value',
  isEnabled: 'isEnabled',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CpPlatformSettingScalarFieldEnum = {
  id: 'id',
  key: 'key',
  description: 'description',
  value: 'value',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CpUsageEventScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  eventType: 'eventType',
  quantity: 'quantity',
  countryCode: 'countryCode',
  idempotencyKey: 'idempotencyKey',
  occurredAt: 'occurredAt',
  recordedAt: 'recordedAt'
};

exports.Prisma.CpTenantLifecycleEventScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  fromStatus: 'fromStatus',
  toStatus: 'toStatus',
  triggeredBy: 'triggeredBy',
  actorId: 'actorId',
  reason: 'reason',
  metadata: 'metadata',
  occurredAt: 'occurredAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  CpPlatformUser: 'CpPlatformUser',
  CpPlan: 'CpPlan',
  CpSubscription: 'CpSubscription',
  CpInvoice: 'CpInvoice',
  CpCollectionAttempt: 'CpCollectionAttempt',
  CpInvoiceLineItem: 'CpInvoiceLineItem',
  CpPlatformWallet: 'CpPlatformWallet',
  CpWalletEntry: 'CpWalletEntry',
  CpBillingPaymentMethod: 'CpBillingPaymentMethod',
  CpPaymentAttempt: 'CpPaymentAttempt',
  CpDispute: 'CpDispute',
  CpDisputeEvidence: 'CpDisputeEvidence',
  CpDisputeTimeline: 'CpDisputeTimeline',
  CpEvidenceRecord: 'CpEvidenceRecord',
  CpIssuedDocument: 'CpIssuedDocument',
  CpFeatureFlag: 'CpFeatureFlag',
  CpFeatureFlagOverride: 'CpFeatureFlagOverride',
  CpPlatformSetting: 'CpPlatformSetting',
  CpUsageEvent: 'CpUsageEvent',
  CpTenantLifecycleEvent: 'CpTenantLifecycleEvent'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
