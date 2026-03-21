
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime
} = require('./runtime/library.js')


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

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.NotFoundError = NotFoundError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

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




  const path = require('path')

/**
 * Enums
 */
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.IntelPersonScalarFieldEnum = {
  id: 'id',
  globalRiskScore: 'globalRiskScore',
  isWatchlisted: 'isWatchlisted',
  hasDuplicateFlag: 'hasDuplicateFlag',
  fraudSignalCount: 'fraudSignalCount',
  verificationConfidence: 'verificationConfidence',
  fullName: 'fullName',
  dateOfBirth: 'dateOfBirth',
  address: 'address',
  gender: 'gender',
  photoUrl: 'photoUrl',
  verificationStatus: 'verificationStatus',
  verificationProvider: 'verificationProvider',
  verificationCountryCode: 'verificationCountryCode',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.IntelPersonIdentifierScalarFieldEnum = {
  id: 'id',
  personId: 'personId',
  type: 'type',
  value: 'value',
  countryCode: 'countryCode',
  isVerified: 'isVerified',
  createdAt: 'createdAt'
};

exports.Prisma.IntelBiometricProfileScalarFieldEnum = {
  id: 'id',
  personId: 'personId',
  modality: 'modality',
  embeddingCiphertext: 'embeddingCiphertext',
  qualityScore: 'qualityScore',
  isActive: 'isActive',
  enrolledAt: 'enrolledAt'
};

exports.Prisma.IntelRiskSignalScalarFieldEnum = {
  id: 'id',
  personId: 'personId',
  type: 'type',
  severity: 'severity',
  source: 'source',
  isActive: 'isActive',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.IntelPersonTenantPresenceScalarFieldEnum = {
  id: 'id',
  personId: 'personId',
  tenantId: 'tenantId',
  roleType: 'roleType',
  createdAt: 'createdAt'
};

exports.Prisma.IntelReviewCaseScalarFieldEnum = {
  id: 'id',
  personId: 'personId',
  status: 'status',
  resolution: 'resolution',
  confidenceScore: 'confidenceScore',
  evidence: 'evidence',
  reviewedBy: 'reviewedBy',
  reviewedAt: 'reviewedAt',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.IntelWatchlistEntryScalarFieldEnum = {
  id: 'id',
  personId: 'personId',
  type: 'type',
  reason: 'reason',
  addedBy: 'addedBy',
  expiresAt: 'expiresAt',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.IntelLinkageEventScalarFieldEnum = {
  id: 'id',
  personId: 'personId',
  eventType: 'eventType',
  confidenceScore: 'confidenceScore',
  actor: 'actor',
  reason: 'reason',
  metadata: 'metadata',
  occurredAt: 'occurredAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};


exports.Prisma.ModelName = {
  IntelPerson: 'IntelPerson',
  IntelPersonIdentifier: 'IntelPersonIdentifier',
  IntelBiometricProfile: 'IntelBiometricProfile',
  IntelRiskSignal: 'IntelRiskSignal',
  IntelPersonTenantPresence: 'IntelPersonTenantPresence',
  IntelReviewCase: 'IntelReviewCase',
  IntelWatchlistEntry: 'IntelWatchlistEntry',
  IntelLinkageEvent: 'IntelLinkageEvent'
};
/**
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "/Users/seyiadelaju/mobility-os/apps/api-intelligence/src/generated/prisma",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "darwin-arm64",
        "native": true
      }
    ],
    "previewFeatures": [
      "postgresqlExtensions"
    ],
    "sourceFilePath": "/Users/seyiadelaju/mobility-os/apps/api-intelligence/src/database/prisma/schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null,
    "schemaEnvPath": "../../../.env"
  },
  "relativePath": "../../database/prisma",
  "clientVersion": "5.22.0",
  "engineVersion": "605197351a3c8bdd595af2d2a9bc3025bca48ea2",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "postgresql",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "// =============================================================================\n// Intelligence Plane — Prisma Schema (api-intelligence)\n//\n// Table naming: intel_* prefix on every table.\n// This schema owns the canonical person graph. Tenant data planes reference\n// intel_persons.id as a plain String foreign key — no Prisma cross-schema\n// relations.\n//\n// pgvector is declared as an extension so migrations install it automatically.\n// Biometric embeddings are stored as encrypted Bytes (AES-256 ciphertext).\n// Vector similarity search uses raw SQL queries executed by the matching\n// service — the embedding bytes are never returned to API callers.\n//\n// See docs/intelligence/ for the full design.\n//\n// Generated client output: src/generated/prisma\n// (relative to this file: ../../generated/prisma)\n// =============================================================================\n\ngenerator client {\n  provider        = \"prisma-client-js\"\n  output          = \"../../generated/prisma\"\n  previewFeatures = [\"postgresqlExtensions\"]\n}\n\ndatasource db {\n  provider   = \"postgresql\"\n  url        = env(\"DATABASE_URL\")\n  // pgvector: installed by prisma migrate; used for vector similarity\n  // in raw SQL queries within the matching service.\n  extensions = [pgvector(map: \"vector\")]\n}\n\n// ── Canonical Persons ─────────────────────────────────────────────────────────\n// One record per real-world person across the entire platform.\n// Tenant operational records (driver profiles, etc.) reference this id.\n// See docs/intelligence/person-graph.md.\n\nmodel IntelPerson {\n  id String @id @default(cuid())\n\n  // Aggregate risk score 0–100. Recomputed when any contributing signal changes.\n  globalRiskScore  Int     @default(0)\n  isWatchlisted    Boolean @default(false)\n  // True if an unresolved identity conflict (duplicate identity) exists.\n  hasDuplicateFlag Boolean @default(false)\n  // Count of active fraud signals. Derived field kept denormalized for query speed.\n  fraudSignalCount Int     @default(0)\n\n  // Confidence of the most recent successful identity verification (0.0–1.0).\n  verificationConfidence  Float   @default(0)\n  fullName                String?\n  dateOfBirth             String?\n  address                 String?\n  gender                  String?\n  photoUrl                String?\n  verificationStatus      String?\n  verificationProvider    String?\n  verificationCountryCode String?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  identifiers     IntelPersonIdentifier[]\n  biometrics      IntelBiometricProfile[]\n  riskSignals     IntelRiskSignal[]\n  tenantPresences IntelPersonTenantPresence[]\n  reviewCases     IntelReviewCase[]\n\n  @@map(\"intel_persons\")\n}\n\n// ── Person Identifiers ────────────────────────────────────────────────────────\n// Government IDs, phone numbers, emails, etc. linked to a canonical person.\n// See docs/intelligence/identity-resolution.md — Resolution Inputs.\n\nmodel IntelPersonIdentifier {\n  id          String  @id @default(cuid())\n  personId    String\n  // IdentifierType from @mobility-os/intelligence-domain:\n  // NATIONAL_ID | PASSPORT | DRIVERS_LICENSE | PHONE | EMAIL | TAX_ID | BANK_ID\n  type        String\n  // Normalized value (E.164 for phone, lowercase for email, etc.).\n  value       String\n  // ISO 3166-1 alpha-2 — required for NATIONAL_ID to disambiguate countries.\n  countryCode String?\n  isVerified  Boolean @default(false)\n\n  createdAt DateTime @default(now())\n\n  person IntelPerson @relation(fields: [personId], references: [id], onDelete: Restrict)\n\n  // Global uniqueness per (type, value) — a duplicate triggers a conflict review.\n  // Exception: PHONE and EMAIL may be shared (family members); handled by the\n  // resolution algorithm with lower weight. See identity-resolution.md.\n  @@unique([type, value])\n  @@index([personId])\n  @@map(\"intel_person_identifiers\")\n}\n\n// ── Biometric Profiles ────────────────────────────────────────────────────────\n// Encrypted face / fingerprint embeddings.\n// Raw biometric images are NOT stored — only the mathematical embedding.\n//\n// Storage design:\n//   embeddingCiphertext: AES-256-GCM encrypted embedding vector bytes.\n//   The encryption key is BIOMETRIC_ENCRYPTION_KEY from env.\n//   The unencrypted vector is only materialised in memory during similarity\n//   searches, which are executed via raw SQL using a decrypted shadow table\n//   or in-process comparison (matching service handles this).\n\nmodel IntelBiometricProfile {\n  id                  String  @id @default(cuid())\n  personId            String\n  // BiometricModality: face | fingerprint\n  modality            String\n  // AES-256-GCM ciphertext of the embedding vector (Bytes, not vector type).\n  // The nonce / IV is prepended to the ciphertext (first 12 bytes).\n  embeddingCiphertext Bytes\n  // Quality score of the source image at enrollment time (0.0–1.0).\n  qualityScore        Float\n  // False after a superseding enrollment or erasure request.\n  isActive            Boolean @default(true)\n\n  enrolledAt DateTime @default(now())\n\n  person IntelPerson @relation(fields: [personId], references: [id], onDelete: Restrict)\n\n  @@index([personId, modality, isActive])\n  @@map(\"intel_biometric_profiles\")\n}\n\n// ── Risk Signals ──────────────────────────────────────────────────────────────\n// Fraud indicators and risk flags attached to a canonical person.\n// Signals are immutable — deactivated by setting isActive = false.\n\nmodel IntelRiskSignal {\n  id       String  @id @default(cuid())\n  personId String\n  // FraudSignalType from @mobility-os/intelligence-domain.\n  type     String\n  // 'low' | 'medium' | 'high' | 'critical'\n  severity String\n  // Who contributed this signal: 'system' | 'tenant_report' | 'external_feed'\n  source   String\n  isActive Boolean @default(true)\n  // Structured metadata (e.g. conflicting person IDs, tenant ID for reports).\n  // Never contains PII from another tenant's operational records.\n  metadata Json?\n\n  createdAt DateTime @default(now())\n\n  person IntelPerson @relation(fields: [personId], references: [id], onDelete: Restrict)\n\n  @@index([personId, isActive])\n  @@map(\"intel_risk_signals\")\n}\n\n// ── Person Tenant Presence ────────────────────────────────────────────────────\n// Tracks which tenants a person has appeared in, and in which operational role.\n// Cross-tenant — a person may appear in many tenants and may serve in multiple\n// roles (e.g. driver at one tenant, guarantor at another — or both at the same\n// tenant, which triggers a cross-role risk signal).\n// Tenants do not see each other's records; used internally for risk aggregation.\n\nmodel IntelPersonTenantPresence {\n  id       String @id @default(cuid())\n  personId String\n  // References tenants.id in api-core (cross-schema, no Prisma relation).\n  tenantId String\n  // Operational role: 'driver' | 'guarantor'\n  // Defaults to 'driver' so existing rows retain their meaning without migration.\n  roleType String @default(\"driver\")\n\n  createdAt DateTime @default(now())\n\n  person IntelPerson @relation(fields: [personId], references: [id], onDelete: Restrict)\n\n  // A person appears once per (tenant, role) pair.\n  // The same person CAN appear as both driver and guarantor at the same tenant —\n  // which is a valid state (surfaced as a cross_role_presence risk signal).\n  @@unique([personId, tenantId, roleType])\n  @@index([tenantId])\n  @@index([personId, roleType])\n  @@map(\"intel_person_tenant_presences\")\n}\n\n// ── Review Cases ──────────────────────────────────────────────────────────────\n// Created when identity resolution cannot auto-decide.\n// A platform intelligence reviewer adjudicates: merge, separate, or flag fraud.\n// See docs/intelligence/identity-resolution.md — Review Cases.\n\nmodel IntelReviewCase {\n  id              String    @id @default(cuid())\n  personId        String\n  // ReviewCaseStatus: open | in_review | resolved | escalated\n  status          String    @default(\"open\")\n  // Resolution type: 'merge' | 'separate' | 'fraud_confirmed' | 'dismissed'\n  resolution      String?\n  // The composite confidence score that triggered this case (0.0–1.0).\n  confidenceScore Float\n  // Structured evidence: identifier conflicts, biometric match scores, etc.\n  // Never contains raw cross-tenant operational records.\n  evidence        Json\n  // Platform staff user ID who reviewed this case.\n  reviewedBy      String?\n  reviewedAt      DateTime?\n  notes           String?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  person IntelPerson @relation(fields: [personId], references: [id], onDelete: Restrict)\n\n  @@index([status])\n  @@map(\"intel_review_cases\")\n}\n\n// ── Watchlist Entries ─────────────────────────────────────────────────────────\n// Platform-level watchlist. Tenants see isWatchlisted: boolean only.\n\nmodel IntelWatchlistEntry {\n  id        String    @id @default(cuid())\n  personId  String\n  // WatchlistEntryType: platform_blacklist | fraud_suspect | duplicate_identity |\n  //                     document_fraud | external_sanctions\n  type      String\n  reason    String\n  // Platform staff user who added this entry.\n  addedBy   String\n  // Null means permanent; set to auto-expire temporary flags.\n  expiresAt DateTime?\n  isActive  Boolean   @default(true)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([personId, isActive])\n  @@map(\"intel_watchlist_entries\")\n}\n\n// ── Linkage Events ────────────────────────────────────────────────────────────\n// Append-only audit trail of all person linkage decisions.\n// See docs/intelligence/cross-tenant-linkage-policy.md — Audit Trail.\n\nmodel IntelLinkageEvent {\n  id              String  @id @default(cuid())\n  // The person record affected by this event.\n  personId        String\n  // 'auto_linked' | 'manual_linked' | 'separated' | 'merged' | 'conflict_flagged'\n  eventType       String\n  // Confidence score at time of decision (automated events only).\n  confidenceScore Float?\n  // 'system' for automated; platform staff user ID for manual.\n  actor           String\n  reason          String?\n  metadata        Json?\n\n  occurredAt DateTime @default(now())\n\n  @@index([personId])\n  @@map(\"intel_linkage_events\")\n}\n",
  "inlineSchemaHash": "5a42583a7c54dd016d0c0928a22ce7549fc7810e68462308b6f223e8f22b306b",
  "copyEngine": true
}

const fs = require('fs')

config.dirname = __dirname
if (!fs.existsSync(path.join(__dirname, 'schema.prisma'))) {
  const alternativePaths = [
    "src/generated/prisma",
    "generated/prisma",
  ]
  
  const alternativePath = alternativePaths.find((altPath) => {
    return fs.existsSync(path.join(process.cwd(), altPath, 'schema.prisma'))
  }) ?? alternativePaths[0]

  config.dirname = path.join(process.cwd(), alternativePath)
  config.isBundled = true
}

config.runtimeDataModel = JSON.parse("{\"models\":{\"IntelPerson\":{\"dbName\":\"intel_persons\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"globalRiskScore\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isWatchlisted\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"hasDuplicateFlag\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fraudSignalCount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"verificationConfidence\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Float\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fullName\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dateOfBirth\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"address\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"gender\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"photoUrl\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"verificationStatus\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"verificationProvider\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"verificationCountryCode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"identifiers\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"IntelPersonIdentifier\",\"relationName\":\"IntelPersonToIntelPersonIdentifier\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"biometrics\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"IntelBiometricProfile\",\"relationName\":\"IntelBiometricProfileToIntelPerson\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"riskSignals\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"IntelRiskSignal\",\"relationName\":\"IntelPersonToIntelRiskSignal\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenantPresences\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"IntelPersonTenantPresence\",\"relationName\":\"IntelPersonToIntelPersonTenantPresence\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reviewCases\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"IntelReviewCase\",\"relationName\":\"IntelPersonToIntelReviewCase\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"IntelPersonIdentifier\":{\"dbName\":\"intel_person_identifiers\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"personId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"value\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"countryCode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isVerified\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"person\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"IntelPerson\",\"relationName\":\"IntelPersonToIntelPersonIdentifier\",\"relationFromFields\":[\"personId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"type\",\"value\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"type\",\"value\"]}],\"isGenerated\":false},\"IntelBiometricProfile\":{\"dbName\":\"intel_biometric_profiles\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"personId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"modality\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"embeddingCiphertext\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Bytes\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"qualityScore\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isActive\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"enrolledAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"person\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"IntelPerson\",\"relationName\":\"IntelBiometricProfileToIntelPerson\",\"relationFromFields\":[\"personId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"IntelRiskSignal\":{\"dbName\":\"intel_risk_signals\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"personId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"severity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"source\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isActive\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metadata\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"person\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"IntelPerson\",\"relationName\":\"IntelPersonToIntelRiskSignal\",\"relationFromFields\":[\"personId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"IntelPersonTenantPresence\":{\"dbName\":\"intel_person_tenant_presences\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"personId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tenantId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"roleType\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"driver\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"person\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"IntelPerson\",\"relationName\":\"IntelPersonToIntelPersonTenantPresence\",\"relationFromFields\":[\"personId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"personId\",\"tenantId\",\"roleType\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"personId\",\"tenantId\",\"roleType\"]}],\"isGenerated\":false},\"IntelReviewCase\":{\"dbName\":\"intel_review_cases\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"personId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"open\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"resolution\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"confidenceScore\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"evidence\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reviewedBy\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reviewedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"person\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"IntelPerson\",\"relationName\":\"IntelPersonToIntelReviewCase\",\"relationFromFields\":[\"personId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"IntelWatchlistEntry\":{\"dbName\":\"intel_watchlist_entries\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"personId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reason\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"addedBy\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"expiresAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isActive\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"IntelLinkageEvent\":{\"dbName\":\"intel_linkage_events\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"cuid\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"personId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"eventType\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"confidenceScore\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"actor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reason\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metadata\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"occurredAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}},\"enums\":{},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = undefined


const { warnEnvConflicts } = require('./runtime/library.js')

warnEnvConflicts({
    rootEnvPath: config.relativeEnvPaths.rootEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.rootEnvPath),
    schemaEnvPath: config.relativeEnvPaths.schemaEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.schemaEnvPath)
})

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

// file annotations for bundling tools to include these files
path.join(__dirname, "libquery_engine-darwin-arm64.dylib.node");
path.join(process.cwd(), "src/generated/prisma/libquery_engine-darwin-arm64.dylib.node")
// file annotations for bundling tools to include these files
path.join(__dirname, "schema.prisma");
path.join(process.cwd(), "src/generated/prisma/schema.prisma")
