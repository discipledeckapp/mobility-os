import Link from 'next/link';
import type { Route } from 'next';
import { Badge, Text } from '@mobility-os/ui';
import {
  TenantEmptyStateCard,
  TenantHeroPanel,
  TenantMetricCard,
  TenantMetricGrid,
  TenantSectionHeader,
  TenantSurfaceCard,
} from '../../features/shared/tenant-page-patterns';
import { TenantAppShell } from '../../features/shared/tenant-app-shell';
import {
  getTenantApiToken,
  getTenantSession,
  listDriverDocumentReviewQueue,
  listDriverLicenceReviewQueue,
  listOperationalDisputes,
  listOperationalDocuments,
  type DriverDocumentReviewQueueRecord,
  type DriverLicenceReviewQueueRecord,
  type RecordDisputeRecord,
  type RecordDocumentRecord,
} from '../../lib/api-core';

function formatDate(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function disputeTone(
  status: string,
): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'resolved') return 'success';
  if (status === 'open' || status === 'under_review') return 'warning';
  if (status === 'rejected' || status === 'escalated') return 'danger';
  return 'neutral';
}

function documentTone(
  status: string,
): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'verified' || status === 'signed') return 'success';
  if (status === 'pending') return 'warning';
  if (status === 'rejected' || status === 'voided') return 'danger';
  return 'neutral';
}

function formatEntityLabel(type: string, id: string) {
  const normalized = type.replace(/_/g, ' ');
  return `${normalized} · ${id.slice(0, 8)}`;
}

function groupDocumentTypes(documents: RecordDocumentRecord[]) {
  return Array.from(
    documents.reduce((accumulator, document) => {
      accumulator.set(
        document.documentType,
        (accumulator.get(document.documentType) ?? 0) + 1,
      );
      return accumulator;
    }, new Map<string, number>()),
  )
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3);
}

function sumDisputeExposure(disputes: RecordDisputeRecord[]) {
  return disputes.reduce((total, dispute) => total + (dispute.finalAmountMinorUnits ?? 0), 0);
}

function riskImpactTone(
  riskImpact: string,
): 'success' | 'warning' | 'danger' | 'neutral' {
  if (riskImpact === 'low') return 'success';
  if (riskImpact === 'medium') return 'warning';
  if (riskImpact === 'high' || riskImpact === 'critical') return 'danger';
  return 'neutral';
}

function complianceTone(
  status: string,
): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'verified' || status === 'approved') return 'success';
  if (status === 'pending' || status === 'under_review') return 'warning';
  if (status === 'rejected' || status === 'expired' || status === 'invalid') return 'danger';
  return 'neutral';
}

export default async function RecordsPage() {
  const token = await getTenantApiToken().catch(() => undefined);
  const [session, documentsResult, disputesResult, documentQueueResult, licenceQueueResult] = await Promise.all([
    getTenantSession(token).catch(() => null),
    listOperationalDocuments({}, token)
      .then((documents) => ({ documents, error: null as string | null }))
      .catch((error) => ({
        documents: [] as RecordDocumentRecord[],
        error: error instanceof Error ? error.message : 'Unable to load operational documents.',
      })),
    listOperationalDisputes({}, token)
      .then((disputes) => ({ disputes, error: null as string | null }))
      .catch((error) => ({
        disputes: [] as RecordDisputeRecord[],
        error: error instanceof Error ? error.message : 'Unable to load operational disputes.',
      })),
    listDriverDocumentReviewQueue({ limit: 8 }, token)
      .then((queue) => ({
        queue: queue.data,
        error: null as string | null,
      }))
      .catch((error) => ({
        queue: [] as DriverDocumentReviewQueueRecord[],
        error:
          error instanceof Error ? error.message : 'Unable to load driver document review queue.',
      })),
    listDriverLicenceReviewQueue({ limit: 8 }, token)
      .then((queue) => ({
        queue: queue.data,
        error: null as string | null,
      }))
      .catch((error) => ({
        queue: [] as DriverLicenceReviewQueueRecord[],
        error:
          error instanceof Error ? error.message : 'Unable to load driver licence review queue.',
      })),
  ]);

  const locale = session?.formattingLocale ?? 'en-NG';
  const documents = documentsResult.documents
    .slice()
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  const disputes = disputesResult.disputes
    .slice()
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  const openDisputes = disputes.filter((dispute) => dispute.status !== 'resolved');
  const signedDocuments = documents.filter((document) =>
    ['verified', 'signed'].includes(document.status),
  );
  const driverDocumentQueue = documentQueueResult.queue;
  const driverLicenceQueue = licenceQueueResult.queue;
  const topDocumentTypes = groupDocumentTypes(documents);
  const disputeExposure = sumDisputeExposure(openDisputes);

  return (
    <TenantAppShell
      description="Review signed operational documents, track disputes, and keep a visible history of the records supporting assignments, remittance, and fleet operations."
      eyebrow="Operations"
      title="Records"
    >
      <div className="space-y-6">
        <TenantHeroPanel
          actions={
            <>
              <Link
                className="inline-flex h-11 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                href={'/drivers' as Route}
              >
                Review drivers
              </Link>
              <Link
                className="inline-flex h-11 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-transparent bg-[var(--mobiris-primary)] px-5 text-sm font-semibold text-white shadow-[0_16px_32px_-18px_rgba(37,99,235,0.7)] transition-all hover:bg-[var(--mobiris-primary-dark)]"
                href={'/remittance' as Route}
              >
                Open remittance
              </Link>
            </>
          }
          description="This is the tenant-side audit surface for operational paperwork and dispute history. Use it to confirm signed records exist, inspect disputed financial events, and jump back into the owning workflow when action is needed."
          eyebrow="Registry"
          title="Operational record history"
        >
          <div className="flex flex-wrap gap-2">
            {topDocumentTypes.length > 0 ? (
              topDocumentTypes.map(([documentType, count]) => (
                <Badge key={documentType} tone="neutral">
                  {documentType.replace(/_/g, ' ')} · {count}
                </Badge>
              ))
            ) : (
              <Badge tone="neutral">No record documents yet</Badge>
            )}
          </div>
        </TenantHeroPanel>

        <TenantMetricGrid>
          <TenantMetricCard
            accent="sky"
            label="Documents"
            note="Signed or generated operational records."
            value={documents.length.toString()}
          />
          <TenantMetricCard
            accent="success"
            label="Signed / verified"
            note="Documents already accepted into the audit trail."
            value={signedDocuments.length.toString()}
          />
          <TenantMetricCard
            accent={openDisputes.length > 0 ? 'warning' : 'slate'}
            label="Open disputes"
            note="Disputes that still require review or settlement."
            value={openDisputes.length.toString()}
          />
          <TenantMetricCard
            accent={disputeExposure > 0 ? 'danger' : 'slate'}
            label="Open exposure"
            note="Final amount currently tied up in unresolved disputes."
            value={new Intl.NumberFormat(locale, {
              style: 'currency',
              currency:
                openDisputes.find((dispute) => dispute.currency)?.currency ?? 'NGN',
              maximumFractionDigits: 2,
            }).format(disputeExposure / 100)}
          />
          <TenantMetricCard
            accent={driverDocumentQueue.length + driverLicenceQueue.length > 0 ? 'warning' : 'slate'}
            label="Compliance review queue"
            note="Driver document and licence reviews still awaiting action."
            value={(driverDocumentQueue.length + driverLicenceQueue.length).toString()}
          />
        </TenantMetricGrid>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <TenantSurfaceCard
            contentClassName="pt-6"
            description="Recent generated or uploaded operational documents across drivers, assignments, remittance, and fleet activity."
            title="Document ledger"
          >
            {documentsResult.error ? (
              <TenantEmptyStateCard
                description={documentsResult.error}
                title="Unable to load operational documents"
                tone="warning"
              />
            ) : documents.length === 0 ? (
              <TenantEmptyStateCard
                description="Signed records and generated paperwork will appear here once operators start moving through assignments, remittance, and driver workflows."
                title="No operational documents yet"
              />
            ) : (
              <div className="space-y-3">
                {documents.slice(0, 10).map((document) => (
                  <div
                    className="flex flex-wrap items-start justify-between gap-3 rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 px-4 py-3"
                    key={document.id}
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Text tone="strong">{document.documentType.replace(/_/g, ' ')}</Text>
                        <Badge tone={documentTone(document.status)}>{document.status}</Badge>
                      </div>
                      <Text tone="muted">{document.fileName}</Text>
                      <Text tone="muted">
                        {formatEntityLabel(document.relatedEntityType, document.relatedEntityId)}
                      </Text>
                      <Text tone="muted">
                        Signed {formatDate(document.signedAt, locale)}
                      </Text>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                        href={`/api/records/documents/${document.id}/content` as Route}
                      >
                        Open file
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TenantSurfaceCard>

          <TenantSurfaceCard
            contentClassName="pt-6"
            description="Disputes tied to remittance, evidence, or other operational records that may need intervention."
            title="Dispute watchlist"
          >
            {disputesResult.error ? (
              <TenantEmptyStateCard
                description={disputesResult.error}
                title="Unable to load disputes"
                tone="warning"
              />
            ) : disputes.length === 0 ? (
              <TenantEmptyStateCard
                description="When a remittance, document, or other operational event is contested, it will show up here with its evidence trail."
                title="No disputes on record"
              />
            ) : (
              <div className="space-y-3">
                {disputes.slice(0, 8).map((dispute) => (
                  <div
                    className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 px-4 py-3"
                    key={dispute.id}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Text tone="strong">{dispute.title}</Text>
                          <Badge tone={disputeTone(dispute.status)}>{dispute.status}</Badge>
                          <Badge tone="neutral">{dispute.priority}</Badge>
                        </div>
                        <Text tone="muted">
                          {dispute.disputeType.replace(/_/g, ' ')} · {dispute.reasonCode.replace(/_/g, ' ')}
                        </Text>
                        <Text tone="muted">
                          {formatEntityLabel(dispute.relatedEntityType, dispute.relatedEntityId)}
                        </Text>
                        <Text tone="muted">
                          Evidence {dispute.evidence.length} · Timeline {dispute.timeline.length}
                        </Text>
                      </div>
                      <div className="space-y-2 text-right">
                        <Text tone="muted">{formatDate(dispute.createdAt, locale)}</Text>
                        <Text tone="strong">
                          {dispute.finalAmountMinorUnits != null
                            ? new Intl.NumberFormat(locale, {
                                style: 'currency',
                                currency: dispute.currency ?? 'NGN',
                                maximumFractionDigits: 2,
                              }).format(dispute.finalAmountMinorUnits / 100)
                            : 'Amount pending'}
                        </Text>
                      </div>
                    </div>
                    <div className="mt-3 rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-white/70 bg-white px-3 py-2">
                      <Text tone="muted">{dispute.narrative}</Text>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TenantSurfaceCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <TenantSurfaceCard
            actions={
              <Link
                className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                href={'/drivers/review-queue' as Route}
              >
                Open driver review queue
              </Link>
            }
            contentClassName="pt-6"
            description="Driver-uploaded identity and compliance documents still waiting for operator review."
            title="Driver document compliance"
          >
            {documentQueueResult.error ? (
              <TenantEmptyStateCard
                description={documentQueueResult.error}
                title="Unable to load driver document review queue"
                tone="warning"
              />
            ) : driverDocumentQueue.length === 0 ? (
              <TenantEmptyStateCard
                description="Pending driver document submissions will appear here when they need an operator decision."
                title="No driver document reviews waiting"
              />
            ) : (
              <div className="space-y-3">
                {driverDocumentQueue.map((item) => (
                  <div
                    className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 px-4 py-3"
                    key={item.id}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Text tone="strong">{item.driverName}</Text>
                          <Badge tone={complianceTone(item.status)}>{item.status}</Badge>
                        </div>
                        <Text tone="muted">
                          {item.documentType.replace(/_/g, ' ')} · {item.fileName}
                        </Text>
                        <Text tone="muted">
                          Driver status {item.driverStatus} · Fleet {item.fleetId}
                        </Text>
                      </div>
                      <div className="space-y-1 text-right">
                        <Text tone="muted">{formatDate(item.createdAt, locale)}</Text>
                        <div className="flex flex-wrap justify-end gap-2">
                          <Link
                            className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                            href={`/drivers/${item.driverId}` as Route}
                          >
                            Open driver
                          </Link>
                          <Link
                            className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                            href={`/drivers/${item.driverId}/review` as Route}
                          >
                            Review evidence
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TenantSurfaceCard>

          <TenantSurfaceCard
            actions={
              <Link
                className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                href={'/drivers/licence-review' as Route}
              >
                Open licence review queue
              </Link>
            }
            contentClassName="pt-6"
            description="Licence verification outcomes that still need manual attention because of expiry, linkage risk, or unresolved review state."
            title="Licence verification watch"
          >
            {licenceQueueResult.error ? (
              <TenantEmptyStateCard
                description={licenceQueueResult.error}
                title="Unable to load licence review queue"
                tone="warning"
              />
            ) : driverLicenceQueue.length === 0 ? (
              <TenantEmptyStateCard
                description="Licence reviews that need human attention will appear here when the automated flow cannot close them confidently."
                title="No licence reviews waiting"
              />
            ) : (
              <div className="space-y-3">
                {driverLicenceQueue.map((item) => (
                  <div
                    className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 px-4 py-3"
                    key={item.id}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Text tone="strong">{item.driverName}</Text>
                          <Badge tone={complianceTone(item.status)}>{item.status}</Badge>
                          <Badge tone={riskImpactTone(item.riskImpact)}>{item.riskImpact} risk</Badge>
                        </div>
                        <Text tone="muted">
                          Linkage {item.linkageDecision.replace(/_/g, ' ')} · validity {item.validity ?? 'unknown'}
                        </Text>
                        <Text tone="muted">
                          Expiry {item.expiryDate ? formatDate(item.expiryDate, locale) : 'not recorded'}
                        </Text>
                      </div>
                      <div className="space-y-1 text-right">
                        <Text tone="muted">
                          {item.overallLinkageScore != null
                            ? `Score ${item.overallLinkageScore}`
                            : 'Score pending'}
                        </Text>
                        <Link
                          className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                          href={`/drivers/${item.driverId}/review` as Route}
                        >
                          Review driver
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TenantSurfaceCard>
        </div>

        <TenantSurfaceCard contentClassName="pt-6">
          <TenantSectionHeader
            description="The records console is a visibility layer, not the source of action. Use these shortcuts to return to the operational flows that generate or resolve the underlying records."
            title="Action paths"
          />
          <div className="grid gap-3 md:grid-cols-3">
            <Link
              className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 px-4 py-4 transition-colors hover:border-slate-300 hover:bg-slate-50"
              href={'/assignments' as Route}
            >
              <Text tone="strong">Assignments</Text>
              <Text tone="muted">Confirm active assignment paperwork and acceptance history.</Text>
            </Link>
            <Link
              className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 px-4 py-4 transition-colors hover:border-slate-300 hover:bg-slate-50"
              href={'/remittance' as Route}
            >
              <Text tone="strong">Remittance</Text>
              <Text tone="muted">Resolve payment disputes and inspect evidence-backed collection history.</Text>
            </Link>
            <Link
              className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 px-4 py-4 transition-colors hover:border-slate-300 hover:bg-slate-50"
              href={'/drivers' as Route}
            >
              <Text tone="strong">Drivers</Text>
              <Text tone="muted">Review uploaded identity and compliance documents tied to a driver record.</Text>
            </Link>
            <Link
              className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 px-4 py-4 transition-colors hover:border-slate-300 hover:bg-slate-50"
              href={'/drivers/licence-review' as Route}
            >
              <Text tone="strong">Licence review</Text>
              <Text tone="muted">Work through unresolved provider-verification and expiry-related licence cases.</Text>
            </Link>
          </div>
        </TenantSurfaceCard>
      </div>
    </TenantAppShell>
  );
}
