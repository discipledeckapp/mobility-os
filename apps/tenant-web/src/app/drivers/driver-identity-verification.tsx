'use client';

import Link from 'next/link';
import { useActionState, useEffect, useMemo, useRef, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  SearchableSelect,
  Text,
} from '@mobility-os/ui';
import {
  getCountryConfig,
  getSupportedCountryCodes,
  isCountrySupported,
  type SupportedIdentifierType,
} from '@mobility-os/domain-config';
import type { DriverRecord } from '../../lib/api-core';
import {
  getDriverIdentityLabel,
  getDriverIdentityStatus,
  getDriverIdentityTone,
} from '../../lib/driver-identity';
import {
  sendDriverSelfServiceLinkAction,
  startDriverSelfServiceVerificationAction,
  startGuarantorSelfServiceVerificationAction,
  resolveDriverVerificationAction,
  resolveDriverSelfServiceVerificationAction,
  resolveGuarantorSelfServiceVerificationAction,
  startDriverVerificationAction,
  type ResolveDriverVerificationActionState,
  type SendDriverSelfServiceLinkActionState,
  type StartDriverVerificationActionState,
} from './actions';

const initialStartState: StartDriverVerificationActionState = {};
const initialResolveState: ResolveDriverVerificationActionState = {};
const initialSendState: SendDriverSelfServiceLinkActionState = {};

// ── Identifier helpers ────────────────────────────────────────────────────────

/** Returns the identifier types that should be collected manually (excludes auto-captured types). */
function getManualIdentifierTypes(countryCode: string): SupportedIdentifierType[] {
  if (!isCountrySupported(countryCode)) return [];
  return getCountryConfig(countryCode).supportedIdentifierTypes.filter(
    (id) => id.type !== 'PHONE' && id.type !== 'EMAIL',
  );
}

function validateIdentifierValue(value: string, config: SupportedIdentifierType): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return config.required ? `${config.label} is required` : null;
  }
  if (config.numericOnly && !/^\d+$/.test(trimmed)) {
    return `${config.label} must contain digits only`;
  }
  if (config.exactLength && trimmed.length !== config.exactLength) {
    return `${config.label} must be exactly ${config.exactLength} digits`;
  }
  return null;
}

function isIdentifierPhaseComplete(
  identifierTypes: SupportedIdentifierType[],
  values: Record<string, string>,
): boolean {
  return identifierTypes.every((id) => validateIdentifierValue(values[id.type] ?? '', id) === null);
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DriverIdentityVerification({
  driver,
  defaultCountryCode,
  mode = 'operator',
  selfServiceToken,
}: {
  driver: DriverRecord;
  defaultCountryCode?: string | null;
  mode?: 'operator' | 'self_service' | 'guarantor_self_service';
  selfServiceToken?: string | null;
}) {
  const initialCountryCode = driver.nationality ?? defaultCountryCode ?? 'NG';
  const [isOpen, setIsOpen] = useState(mode === 'self_service' || mode === 'guarantor_self_service');
  const [countryCode, setCountryCode] = useState(initialCountryCode);
  const countryOptions = useMemo(
    () =>
      getSupportedCountryCodes().map((code) => ({
        value: code,
        label: getCountryConfig(code).name,
      })),
    [],
  );

  const identifierTypes = useMemo(() => getManualIdentifierTypes(countryCode), [countryCode]);
  const [identifierValues, setIdentifierValues] = useState<Record<string, string>>({});
  const [identifierTouched, setIdentifierTouched] = useState<Record<string, boolean>>({});

  // Reset identifier state when country changes
  useEffect(() => {
    setIdentifierValues({});
    setIdentifierTouched({});
  }, [countryCode]);

  const identifierErrors = useMemo(
    () =>
      Object.fromEntries(
        identifierTypes.map((id) => [
          id.type,
          validateIdentifierValue(identifierValues[id.type] ?? '', id),
        ]),
      ),
    [identifierTypes, identifierValues],
  );

  const idPhaseComplete = useMemo(
    () => isIdentifierPhaseComplete(identifierTypes, identifierValues),
    [identifierTypes, identifierValues],
  );

  const [sendState, sendLinkAction, isSendingLink] = useActionState(
    sendDriverSelfServiceLinkAction,
    initialSendState,
  );
  const [startState, startFormAction, isStarting] = useActionState(
    mode === 'guarantor_self_service'
      ? startGuarantorSelfServiceVerificationAction
      : mode === 'self_service'
        ? startDriverSelfServiceVerificationAction
        : startDriverVerificationAction,
    initialStartState,
  );
  const [resolveState, resolveFormAction, isResolving] = useActionState(
    mode === 'guarantor_self_service'
      ? resolveGuarantorSelfServiceVerificationAction
      : mode === 'self_service'
        ? resolveDriverSelfServiceVerificationAction
        : resolveDriverVerificationAction,
    initialResolveState,
  );

  const [selfiePreviewUrl, setSelfiePreviewUrl] = useState<string | null>(null);
  const [selfieImageBase64, setSelfieImageBase64] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [verificationMode, setVerificationMode] = useState<'live' | 'manual'>('live');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const identityStatus = getDriverIdentityStatus(driver, resolveState.result);
  const session = startState.session;
  const result = resolveState.result;
  const identityTone = getDriverIdentityTone(identityStatus);
  const identityLabel = getDriverIdentityLabel(identityStatus);
  const canSendSelfServiceLink = Boolean(driver.email);
  const isManualMode = verificationMode === 'manual';
  const livenessUnavailable = startState.errorCode === 'liveness_unavailable';

  useEffect(() => {
    return () => {
      if (selfiePreviewUrl) URL.revokeObjectURL(selfiePreviewUrl);
      if (streamRef.current) {
        for (const track of streamRef.current.getTracks()) track.stop();
      }
    };
  }, [selfiePreviewUrl]);

  useEffect(() => {
    if (isManualMode || !session || cameraReady || selfiePreviewUrl || streamRef.current) return;
    void startCamera();
  }, [cameraReady, isManualMode, selfiePreviewUrl, session]);

  async function startCamera(): Promise<void> {
    setCameraError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('This browser cannot access the camera for live selfie capture.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      if (streamRef.current) {
        for (const track of streamRef.current.getTracks()) track.stop();
      }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);
    } catch (error) {
      setCameraError(
        error instanceof Error ? error.message : 'Unable to access the camera for live selfie capture.',
      );
    }
  }

  function captureSelfie(): void {
    if (!videoRef.current) { setCameraError('Camera preview is not ready yet.'); return; }
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const context = canvas.getContext('2d');
    if (!context) { setCameraError('Unable to capture the selfie image.'); return; }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const [, base64 = ''] = dataUrl.split(',');
    if (selfiePreviewUrl) URL.revokeObjectURL(selfiePreviewUrl);
    setSelfieImageBase64(base64);
    setSelfiePreviewUrl(dataUrl);
    setCameraReady(false);
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) track.stop();
      streamRef.current = null;
    }
  }

  function resetSelfieCapture(): void {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) track.stop();
      streamRef.current = null;
    }
    if (selfiePreviewUrl) URL.revokeObjectURL(selfiePreviewUrl);
    setSelfiePreviewUrl(null);
    setSelfieImageBase64('');
    setCameraError(null);
    setCameraReady(false);
  }

  function updateIdentifierValue(type: string, value: string): void {
    setIdentifierValues((current) => ({ ...current, [type]: value }));
  }

  function markIdentifierTouched(type: string): void {
    setIdentifierTouched((current) => ({ ...current, [type]: true }));
  }

  return (
    <div className="space-y-4">
      {/* Operator action bar */}
      {mode === 'operator' ? (
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={identityTone}>{identityLabel}</Badge>
          {driver.identityReviewCaseId ? (
            <Link
              className="text-xs font-semibold text-[var(--mobiris-primary-dark)] hover:underline"
              href={`/drivers/${driver.id}/review`}
            >
              Open review
            </Link>
          ) : null}
          <span title={canSendSelfServiceLink ? undefined : 'Add email address to send a self-service link.'}>
            <form action={sendLinkAction}>
              <input name="driverId" type="hidden" value={driver.id} />
              <Button disabled={isSendingLink || !canSendSelfServiceLink} size="sm" type="submit" variant="ghost">
                {isSendingLink ? 'Sending link...' : 'Request driver to self-verify'}
              </Button>
            </form>
          </span>
          <Button onClick={() => setIsOpen((current) => !current)} size="sm" variant="secondary">
            {isOpen ? 'Hide verification' : identityStatus === 'verified' ? 'Re-verify identity' : 'Verify identity'}
          </Button>
        </div>
      ) : null}

      {driver.identityReviewCaseId && !isOpen ? (
        <Text tone="muted">
          Review case {driver.identityReviewCaseId} is holding this driver until a manual decision is recorded.
        </Text>
      ) : null}
      {mode === 'operator' && sendState.error ? <Text tone="danger">{sendState.error}</Text> : null}
      {mode === 'operator' && sendState.success ? <Text tone="success">{sendState.success}</Text> : null}
      {mode === 'operator' && !driver.email ? (
        <Text tone="muted">Add an email address to this driver record to send a self-verification link.</Text>
      ) : null}

      {isOpen ? (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>
              {mode === 'self_service' ? 'Complete identity verification' : 'Verify identity'}
            </CardTitle>
            <CardDescription>
              Enter the driver's identification numbers first, then complete live or manual verification.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* ── Step 1: Country + Identifiers ── */}
            <div className="space-y-4 rounded-[var(--mobiris-radius-card)] border border-[var(--mobiris-border)] bg-white p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--mobiris-primary)] text-xs font-bold text-white">1</div>
                <Text tone="strong">Identification numbers</Text>
              </div>
              <Text tone="muted">
                Enter the driver's identification numbers before starting verification. NIN is required; BVN is optional but recommended.
              </Text>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <SearchableSelect
                    helperText="Country determines which identifier types are required."
                    inputId={`countryCode-${driver.id}`}
                    label="Country"
                    onChange={setCountryCode}
                    options={countryOptions}
                    placeholder="Select country"
                    required
                    value={countryCode}
                  />
                </div>

                {identifierTypes.map((idType) => {
                  const value = identifierValues[idType.type] ?? '';
                  const error = identifierTouched[idType.type] ? identifierErrors[idType.type] : null;
                  const hint = [
                    idType.exactLength ? `${idType.exactLength} digits` : null,
                    idType.numericOnly ? 'numbers only' : null,
                    idType.required ? 'required' : 'optional',
                  ].filter(Boolean).join(' · ');

                  return (
                    <div className="space-y-1.5" key={idType.type}>
                      <Label htmlFor={`${idType.type}-${driver.id}`}>
                        {idType.label}
                        {idType.required ? <span className="ml-1 text-rose-500">*</span> : <span className="ml-1 text-slate-400">(optional)</span>}
                      </Label>
                      <Input
                        autoComplete="off"
                        id={`${idType.type}-${driver.id}`}
                        inputMode={idType.numericOnly ? 'numeric' : 'text'}
                        maxLength={idType.exactLength}
                        onBlur={() => markIdentifierTouched(idType.type)}
                        onChange={(e) => {
                          const raw = idType.numericOnly ? e.target.value.replace(/\D/g, '') : e.target.value;
                          updateIdentifierValue(idType.type, raw);
                        }}
                        placeholder={`Enter ${hint}`}
                        value={value}
                      />
                      {error ? (
                        <Text tone="danger">{error}</Text>
                      ) : value.length > 0 && !identifierErrors[idType.type] ? (
                        <Text tone="success">✓ Valid</Text>
                      ) : (
                        <Text tone="muted">{hint}</Text>
                      )}
                    </div>
                  );
                })}

                {/* Phone on record — shown for context */}
                <div className="space-y-1 rounded-[var(--mobiris-radius-card)] border border-slate-100 bg-slate-50/70 p-3">
                  <Text tone="muted">Phone on record</Text>
                  <Text>{driver.phone}</Text>
                </div>
                {driver.email ? (
                  <div className="space-y-1 rounded-[var(--mobiris-radius-card)] border border-slate-100 bg-slate-50/70 p-3">
                    <Text tone="muted">Email on record</Text>
                    <Text>{driver.email}</Text>
                  </div>
                ) : null}
              </div>

              {!idPhaseComplete && identifierTypes.some((id) => id.required) ? (
                <Text tone="muted">
                  Enter a valid NIN to unlock verification.
                </Text>
              ) : idPhaseComplete ? (
                <Text tone="success">Identification numbers look good — proceed to verification below.</Text>
              ) : null}
            </div>

            {/* ── Step 2: Choose method + Start liveness ── */}
            <div className={`space-y-4 rounded-[var(--mobiris-radius-card)] border p-4 transition-opacity ${idPhaseComplete ? 'border-[var(--mobiris-border)] bg-white opacity-100' : 'border-slate-100 bg-slate-50/50 opacity-50'}`}>
              <div className="flex items-center gap-2">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${idPhaseComplete ? 'bg-[var(--mobiris-primary)]' : 'bg-slate-300'}`}>2</div>
                <Text tone="strong">Choose verification method</Text>
              </div>

              {livenessUnavailable ? (
                <div className="rounded-[var(--mobiris-radius-card)] border border-amber-200 bg-amber-50/60 p-3 space-y-2">
                  <Text tone="strong">Live verification is not available right now</Text>
                  <Text tone="muted">
                    The identity verification service is not configured on this environment. Use manual verification to submit identifiers for review instead.
                  </Text>
                </div>
              ) : null}

              <form action={startFormAction} className="space-y-3">
                {mode === 'self_service' || mode === 'guarantor_self_service' ? (
                  <input name="token" type="hidden" value={selfServiceToken ?? ''} />
                ) : (
                  <input name="driverId" type="hidden" value={driver.id} />
                )}
                <input name="countryCode" type="hidden" value={countryCode} />

                <div className="flex flex-wrap gap-3">
                  <Button
                    disabled={!idPhaseComplete || isStarting || livenessUnavailable}
                    onClick={() => setVerificationMode('live')}
                    type="submit"
                  >
                    {isStarting && verificationMode === 'live' ? 'Starting...' : 'Start live verification'}
                  </Button>
                  <Button
                    disabled={!idPhaseComplete}
                    onClick={() => { setVerificationMode('manual'); resetSelfieCapture(); }}
                    type="button"
                    variant="secondary"
                  >
                    Manual verification only
                  </Button>
                </div>
              </form>

              {startState.error && !livenessUnavailable ? (
                <Text tone="danger">{startState.error}</Text>
              ) : null}

              {/* Liveness session info */}
              {session && !isManualMode ? (
                <div className="rounded-[var(--mobiris-radius-card)] border border-[var(--mobiris-border)] bg-[var(--mobiris-primary-tint)] p-4 space-y-2">
                  <Text tone="strong">Live session active</Text>
                  <div className="grid gap-2 text-sm text-slate-700 md:grid-cols-2">
                    <Text>Provider: {session.providerName}</Text>
                    <Text>{cameraReady ? 'Camera is ready' : selfiePreviewUrl ? 'Selfie captured' : 'Opening camera...'}</Text>
                    <Text>Expires: {session.expiresAt ?? 'Not provided'}</Text>
                    <Text>Fallbacks: {session.fallbackChain.length > 0 ? session.fallbackChain.join(', ') : 'None'}</Text>
                  </div>
                </div>
              ) : null}

              {/* Camera */}
              {session && !isManualMode && !cameraReady && !selfiePreviewUrl ? (
                <Button onClick={() => void startCamera()} type="button" variant="secondary">Open camera again</Button>
              ) : null}
              {cameraReady && !isManualMode ? (
                <div className="space-y-3 rounded-[var(--mobiris-radius-card)] border border-[var(--mobiris-border)] bg-white p-3">
                  <video
                    autoPlay
                    className="max-h-64 w-full rounded-[var(--mobiris-radius-card)] bg-slate-950 object-cover"
                    muted
                    playsInline
                    ref={videoRef}
                  />
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={captureSelfie} type="button">Capture selfie</Button>
                    <Button onClick={resetSelfieCapture} type="button" variant="ghost">Cancel camera</Button>
                  </div>
                </div>
              ) : null}
              {selfiePreviewUrl && !isManualMode ? (
                <div className="space-y-2 rounded-[var(--mobiris-radius-card)] border border-[var(--mobiris-border)] bg-white p-3">
                  <Text tone="strong">Captured selfie</Text>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt="Captured live selfie preview" className="max-h-48 rounded-[var(--mobiris-radius-card)] object-cover" src={selfiePreviewUrl} />
                  <Button onClick={resetSelfieCapture} type="button" variant="ghost">Retake selfie</Button>
                </div>
              ) : null}
              {cameraError ? <Text tone="danger">{cameraError}</Text> : null}
            </div>

            {/* ── Step 3: Consent + Submit ── */}
            <form action={resolveFormAction} className="space-y-4 rounded-[var(--mobiris-radius-card)] border border-[var(--mobiris-border)] bg-white p-4">
              <div className="flex items-center gap-2">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${idPhaseComplete ? 'bg-[var(--mobiris-primary)]' : 'bg-slate-300'}`}>3</div>
                <Text tone="strong">Consent and submit</Text>
              </div>

              {/* Hidden fields */}
              {mode === 'self_service' || mode === 'guarantor_self_service' ? (
                <input name="token" type="hidden" value={selfServiceToken ?? ''} />
              ) : (
                <input name="driverId" type="hidden" value={driver.id} />
              )}
              <input name="verificationMode" type="hidden" value={verificationMode} />
              <input name="countryCode" type="hidden" value={countryCode} />
              <input name="providerName" type="hidden" value={session?.providerName ?? ''} />
              <input name="sessionId" type="hidden" value={session?.sessionId ?? ''} />
              <input name="selfieImageBase64" type="hidden" value={selfieImageBase64} />
              {identifierTypes.map((idType) => (
                <input
                  key={idType.type}
                  name={`identifier_${idType.type}`}
                  type="hidden"
                  value={(identifierValues[idType.type] ?? '').trim()}
                />
              ))}

              <Text tone="muted">
                {isManualMode
                  ? 'This submission will proceed without a live selfie and may be routed to manual review.'
                  : !session
                    ? 'Start live verification above before submitting.'
                    : !selfieImageBase64
                      ? 'Capture a live selfie above before submitting.'
                      : 'Ready to submit.'}
              </Text>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  className="size-4 accent-[var(--mobiris-primary)]"
                  name="subjectConsent"
                  type="checkbox"
                />
                <span>
                  {mode === 'guarantor_self_service'
                    ? 'I confirm I have given consent for my identity and liveness to be verified.'
                    : 'I confirm the driver has given consent for identity and liveness verification.'}
                </span>
              </label>

              <Button
                disabled={
                  !idPhaseComplete ||
                  isResolving ||
                  (!isManualMode && (!session || !selfieImageBase64))
                }
                type="submit"
              >
                {isResolving
                  ? 'Submitting...'
                  : isManualMode
                    ? 'Submit for manual review'
                    : 'Submit verification'}
              </Button>

              {resolveState.error ? <Text tone="danger">{resolveState.error}</Text> : null}

              {result ? (
                <div className="space-y-3 rounded-[var(--mobiris-radius-card)] border border-[var(--mobiris-border)] bg-[var(--mobiris-primary-tint)] p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={identityTone}>{identityLabel}</Badge>
                    {resolveState.success ? <Text>{resolveState.success}</Text> : null}
                  </div>
                  <div className="grid gap-2 text-sm text-slate-700 md:grid-cols-2">
                    <Text>Decision: {result.decision}</Text>
                    <Text>Provider status: {result.providerVerificationStatus ?? result.providerLookupStatus ?? 'Not provided'}</Text>
                    <Text>Liveness passed: {result.livenessPassed === true ? 'Yes' : result.livenessPassed === false ? 'No' : 'Awaiting provider evidence'}</Text>
                    <Text>Liveness confidence: {result.livenessConfidenceScore ?? 'Not returned'}</Text>
                    <Text>Provider: {result.livenessProviderName ?? result.providerName ?? 'Not returned'}</Text>
                    <Text>Confidence: {result.verificationConfidence ?? 'Not returned'}</Text>
                  </div>
                  {result.livenessReason ? <Text tone="muted">{result.livenessReason}</Text> : null}
                  {identityStatus === 'review_needed' ? (
                    <Text>This driver cannot be activated yet. Open the review guidance to see what your operations team should do next.</Text>
                  ) : null}
                </div>
              ) : null}
            </form>

          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
