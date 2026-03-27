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

function sanitizeSelfServiceError(message?: string | null): string | null {
  if (!message) return null;
  const normalized = message.toLowerCase();
  if (
    normalized.includes('provider') ||
    normalized.includes('fallback') ||
    normalized.includes('internal_free_service')
  ) {
    return 'Live verification is unavailable on this device right now. Please try again.';
  }
  return message;
}

// ── Identifier helpers ────────────────────────────────────────────────────────

function getManualIdentifierTypes(countryCode: string): SupportedIdentifierType[] {
  if (!isCountrySupported(countryCode)) return [];
  return getCountryConfig(countryCode).supportedIdentifierTypes.filter(
    (id) => id.type !== 'PHONE' && id.type !== 'EMAIL',
  );
}

function getSelfServiceIdentifierTypes(
  countryCode: string,
  enabledTypes?: string[],
  requiredTypes?: string[],
): SupportedIdentifierType[] {
  const supported = getManualIdentifierTypes(countryCode);
  const enabledSet = new Set((enabledTypes ?? []).map((type) => type.toUpperCase()));
  const requiredSet = new Set((requiredTypes ?? []).map((type) => type.toUpperCase()));
  return supported
    .filter((identifier) => enabledSet.size === 0 || enabledSet.has(identifier.type))
    .map((identifier) => ({
      ...identifier,
      required: requiredSet.has(identifier.type),
    }));
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

function friendlyDecisionLabel(decision: string): string {
  switch (decision) {
    case 'verified': return 'Verification successful';
    case 'review_needed': return 'Verification requires review';
    case 'failed': return 'Verification failed';
    case 'pending': return 'Verification in progress';
    default: return 'Verification in progress';
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DriverIdentityVerification({
  driver,
  defaultCountryCode,
  mode = 'operator',
  selfServiceToken,
  orgDriverPaysKyc = false,
  enabledIdentifierTypes,
  requiredIdentifierTypes,
  onVerificationSubmitted,
}: {
  driver: DriverRecord;
  defaultCountryCode?: string | null;
  mode?: 'operator' | 'self_service' | 'guarantor_self_service';
  selfServiceToken?: string | null;
  orgDriverPaysKyc?: boolean;
  enabledIdentifierTypes?: string[];
  requiredIdentifierTypes?: string[];
  onVerificationSubmitted?: (result: NonNullable<ResolveDriverVerificationActionState['result']>) => void;
}) {
  const initialCountryCode = driver.nationality ?? defaultCountryCode ?? 'NG';
  const [isOpen, setIsOpen] = useState(mode === 'self_service' || mode === 'guarantor_self_service');
  const [sendLinkPaysKyc, setSendLinkPaysKyc] = useState(orgDriverPaysKyc);
  const [countryCode, setCountryCode] = useState(initialCountryCode);
  const countryOptions = useMemo(
    () =>
      getSupportedCountryCodes().map((code) => ({
        value: code,
        label: getCountryConfig(code).name,
      })),
    [],
  );

  const identifierTypes = useMemo(
    () =>
      mode === 'self_service'
        ? getSelfServiceIdentifierTypes(
            countryCode,
            enabledIdentifierTypes,
            requiredIdentifierTypes,
          )
        : getManualIdentifierTypes(countryCode),
    [countryCode, enabledIdentifierTypes, mode, requiredIdentifierTypes],
  );
  const [identifierValues, setIdentifierValues] = useState<Record<string, string>>({});
  const [identifierTouched, setIdentifierTouched] = useState<Record<string, boolean>>({});

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
  const [cameraGuidance, setCameraGuidance] = useState<string>('Position your face in the frame');
  const [captureProgress, setCaptureProgress] = useState(0); // 0 = idle, 1–3 = capturing frame N
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const identityStatus = getDriverIdentityStatus(driver, resolveState.result);
  const session = startState.session;
  const result = resolveState.result;
  const identityTone = getDriverIdentityTone(identityStatus);
  const identityLabel = getDriverIdentityLabel(identityStatus);
  const canSendSelfServiceLink = Boolean(driver.email);

  // Selfie captured = liveness step done; identifier phase = step 2
  const livenessDone = Boolean(selfieImageBase64);

  useEffect(() => {
    return () => {
      if (selfiePreviewUrl) URL.revokeObjectURL(selfiePreviewUrl);
      stopStream();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mode !== 'operator' && resolveState.result && onVerificationSubmitted) {
      onVerificationSubmitted(resolveState.result);
    }
  }, [mode, onVerificationSubmitted, resolveState.result]);

  // Attach stream to video element after it mounts (fixes black screen)
  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (video && stream && !video.srcObject) {
      video.srcObject = stream;
      void video.play().catch(() => {});
    }
  }, [cameraReady]);

  function stopStream(): void {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) track.stop();
      streamRef.current = null;
    }
  }

  async function startCamera(): Promise<void> {
    setCameraError(null);
    setCameraGuidance('Position your face in the frame');
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera access is not available in this browser. Please use a modern browser over HTTPS.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      stopStream();
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
        setCameraReady(true);
      } else {
        // Video element not yet in DOM — setCameraReady will trigger re-render
        // and the useEffect above will attach the stream.
        setCameraReady(true);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'NotAllowedError') {
        setCameraError('Camera permission denied. Please allow camera access in your browser settings and try again.');
      } else {
        setCameraError(error instanceof Error ? error.message : 'Unable to access the camera.');
      }
    }
  }

  function captureFrameWithVariance(video: HTMLVideoElement): { dataUrl: string; variance: number } {
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { dataUrl: '', variance: 0 };
    ctx.drawImage(video, 0, 0, w, h);

    // Compute luminance variance on a 64×64 thumbnail for speed.
    const thumb = document.createElement('canvas');
    thumb.width = 64;
    thumb.height = 64;
    const tCtx = thumb.getContext('2d');
    if (!tCtx) return { dataUrl: canvas.toDataURL('image/jpeg', 0.9), variance: 0 };
    tCtx.drawImage(canvas, 0, 0, 64, 64);
    const px = tCtx.getImageData(0, 0, 64, 64).data;
    let sum = 0;
    let sum2 = 0;
    const n = px.length / 4;
    for (let i = 0; i < px.length; i += 4) {
      // biome-ignore lint/style/noNonNullAssertion: Uint8ClampedArray access within bounds
      const lum = 0.299 * px[i]! + 0.587 * px[i + 1]! + 0.114 * px[i + 2]!;
      sum += lum;
      sum2 += lum * lum;
    }
    const mean = sum / n;
    const variance = sum2 / n - mean * mean;

    return { dataUrl: canvas.toDataURL('image/jpeg', 0.9), variance };
  }

  async function captureAutoFrames(): Promise<void> {
    const video = videoRef.current;
    if (!video) { setCameraError('Camera preview is not ready. Please open the camera again.'); return; }

    const frames: { dataUrl: string; variance: number }[] = [];
    for (let i = 0; i < 3; i++) {
      setCaptureProgress(i + 1);
      frames.push(captureFrameWithVariance(video));
      if (i < 2) await new Promise<void>((resolve) => setTimeout(resolve, 800));
    }
    setCaptureProgress(0);

    // Pick the sharpest frame (highest pixel-luminance variance).
    const best = frames.reduce((a, b) => (a.variance >= b.variance ? a : b));
    if (!best.dataUrl) { setCameraError('Unable to capture the selfie image.'); return; }

    const [, base64 = ''] = best.dataUrl.split(',');
    if (selfiePreviewUrl) URL.revokeObjectURL(selfiePreviewUrl);
    setSelfieImageBase64(base64);
    setSelfiePreviewUrl(best.dataUrl);
    setCameraReady(false);
    stopStream();
  }

  function resetSelfieCapture(): void {
    stopStream();
    if (selfiePreviewUrl) URL.revokeObjectURL(selfiePreviewUrl);
    setSelfiePreviewUrl(null);
    setSelfieImageBase64('');
    setCameraError(null);
    setCameraReady(false);
    setCaptureProgress(0);
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
            <form action={sendLinkAction} className="flex flex-wrap items-center gap-2">
              <input name="driverId" type="hidden" value={driver.id} />
              <input name="driverPaysKycOverride" type="hidden" value={String(sendLinkPaysKyc)} />
              <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-600 select-none">
                <input
                  checked={sendLinkPaysKyc}
                  className="size-3.5 accent-[var(--mobiris-primary)]"
                  onChange={(e) => setSendLinkPaysKyc(e.target.checked)}
                  type="checkbox"
                />
                Driver pays KYC
                {orgDriverPaysKyc !== sendLinkPaysKyc ? (
                  <span className="text-amber-600">(overriding org default)</span>
                ) : null}
              </label>
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
              {mode === 'self_service' ? 'Identity verification' : 'Verify identity'}
            </CardTitle>
            <CardDescription>
              {mode === 'self_service'
                ? 'Capture a live selfie, then enter your identification number to complete verification.'
                : 'Capture a live selfie, then enter the driver\'s identification numbers.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* ── Step 1: Liveness capture ── */}
            <div className="space-y-4 rounded-[var(--mobiris-radius-card)] border border-[var(--mobiris-border)] bg-white p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--mobiris-primary)] text-xs font-bold text-white">1</div>
                <Text tone="strong">Face liveness capture</Text>
              </div>
              <Text tone="muted">
                {mode === 'self_service'
                  ? 'Use this device\'s camera to capture a live selfie. Make sure your face is well-lit and centred.'
                  : 'Start a liveness session, then capture a selfie using this device\'s camera.'}
              </Text>

              {/* Start session form */}
              {!session && !livenessDone ? (
                <form action={startFormAction} className="space-y-3">
                  {mode === 'self_service' || mode === 'guarantor_self_service' ? (
                    <input name="token" type="hidden" value={selfServiceToken ?? ''} />
                  ) : (
                    <input name="driverId" type="hidden" value={driver.id} />
                  )}
                  <input name="countryCode" type="hidden" value={countryCode} />
                  <Button disabled={isStarting} type="submit">
                    {isStarting ? 'Starting...' : 'Start face verification'}
                  </Button>
                  {startState.error ? (
                    <Text tone="danger">
                      {mode === 'self_service'
                        ? sanitizeSelfServiceError(startState.error)
                        : startState.error}
                    </Text>
                  ) : null}
                </form>
              ) : null}

              {/* Session active — camera area */}
              {session && !livenessDone ? (
                <div className="space-y-3">
                  {/* Guidance text */}
                  <div className="rounded-[var(--mobiris-radius-card)] border border-blue-100 bg-blue-50/60 px-4 py-2.5 text-sm font-medium text-blue-700">
                    {cameraError ? '⚠ ' : '📷 '}{cameraError ?? cameraGuidance}
                  </div>

                  {/* Video — always in DOM once session starts; hidden until stream ready */}
                  <div className={`overflow-hidden rounded-[var(--mobiris-radius-card)] border border-[var(--mobiris-border)] bg-slate-950 transition-all ${cameraReady ? 'max-h-72 min-h-[18rem]' : 'max-h-0 border-0'}`}>
                    <video
                      autoPlay
                      className="w-full object-cover"
                      muted
                      playsInline
                      ref={videoRef}
                      onCanPlay={() => setCameraGuidance('Camera is ready — centre your face and capture')}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {!cameraReady ? (
                      <Button onClick={() => void startCamera()} type="button">
                        Open camera
                      </Button>
                    ) : captureProgress > 0 ? (
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1.5">
                          {[1, 2, 3].map((n) => (
                            <span
                              key={n}
                              className={`h-2 w-8 rounded-full transition-colors ${n <= captureProgress ? 'bg-[var(--mobiris-primary)]' : 'bg-slate-200'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-slate-600">Capturing {captureProgress}/3…</span>
                      </div>
                    ) : (
                      <>
                        <Button onClick={() => void captureAutoFrames()} type="button">
                          Capture selfie
                        </Button>
                        <Button onClick={resetSelfieCapture} type="button" variant="ghost">
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Selfie preview */}
              {selfiePreviewUrl && livenessDone ? (
                <div className="space-y-2 rounded-[var(--mobiris-radius-card)] border border-emerald-200 bg-emerald-50/50 p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-medium text-sm">✓ Selfie captured</span>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt="Captured selfie preview" className="max-h-40 rounded-[var(--mobiris-radius-card)] object-cover" src={selfiePreviewUrl} />
                  <Button onClick={resetSelfieCapture} type="button" variant="ghost" size="sm">
                    Retake selfie
                  </Button>
                </div>
              ) : null}
            </div>

            {/* ── Step 2: Identification numbers (shown AFTER selfie captured) ── */}
            <div className={`space-y-4 rounded-[var(--mobiris-radius-card)] border p-4 transition-opacity ${livenessDone ? 'border-[var(--mobiris-border)] bg-white opacity-100' : 'border-slate-100 bg-slate-50/50 opacity-40 pointer-events-none'}`}>
              <div className="flex items-center gap-2">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${livenessDone ? 'bg-[var(--mobiris-primary)]' : 'bg-slate-300'}`}>2</div>
                <Text tone="strong">Identification numbers</Text>
              </div>

              {!livenessDone ? (
                <Text tone="muted">Complete face capture above to unlock this step.</Text>
              ) : (
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

                  {/* Auto-captured context */}
                  {driver.phone ? (
                    <div className="space-y-1 rounded-[var(--mobiris-radius-card)] border border-slate-100 bg-slate-50/70 p-3">
                      <Text tone="muted">Phone on record</Text>
                      <Text>{driver.phone}</Text>
                    </div>
                  ) : null}
                  {driver.email ? (
                    <div className="space-y-1 rounded-[var(--mobiris-radius-card)] border border-slate-100 bg-slate-50/70 p-3">
                      <Text tone="muted">Email on record</Text>
                      <Text>{driver.email}</Text>
                    </div>
                  ) : null}

                  {idPhaseComplete ? (
                    <div className="md:col-span-2">
                      <Text tone="success">Identification numbers look good — proceed to submit below.</Text>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* ── Step 3: Consent + Submit ── */}
            <form action={resolveFormAction} className="space-y-4 rounded-[var(--mobiris-radius-card)] border border-[var(--mobiris-border)] bg-white p-4">
              <div className="flex items-center gap-2">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${livenessDone && idPhaseComplete ? 'bg-[var(--mobiris-primary)]' : 'bg-slate-300'}`}>3</div>
                <Text tone="strong">Consent and submit</Text>
              </div>

              {/* Hidden fields */}
              {mode === 'self_service' || mode === 'guarantor_self_service' ? (
                <input name="token" type="hidden" value={selfServiceToken ?? ''} />
              ) : (
                <input name="driverId" type="hidden" value={driver.id} />
              )}
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
                {!livenessDone
                  ? 'Complete the face capture in step 1 before submitting.'
                  : !idPhaseComplete
                    ? 'Enter your identification number in step 2 before submitting.'
                    : 'Ready to submit your verification.'}
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
                    : mode === 'self_service'
                      ? 'I confirm I have given consent for my identity and liveness to be verified.'
                      : 'I confirm the driver has given consent for identity and liveness verification.'}
                </span>
              </label>

              <Button
                disabled={!livenessDone || !idPhaseComplete || isResolving || !session}
                type="submit"
              >
                {isResolving ? 'Submitting...' : 'Submit verification'}
              </Button>

              {resolveState.error ? (
                <Text tone="danger">
                  {mode === 'self_service'
                    ? sanitizeSelfServiceError(resolveState.error)
                    : resolveState.error}
                </Text>
              ) : null}

              {result ? (
                <div className="space-y-3 rounded-[var(--mobiris-radius-card)] border border-[var(--mobiris-border)] bg-[var(--mobiris-primary-tint)] p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={identityTone}>{identityLabel}</Badge>
                    {resolveState.success ? <Text>{resolveState.success}</Text> : null}
                  </div>
                  <div className="grid gap-2 text-sm text-slate-700 md:grid-cols-2">
                    <Text>{friendlyDecisionLabel(result.decision)}</Text>
                    <Text>
                      {result.livenessPassed === true
                        ? 'Live selfie completed'
                        : result.livenessPassed === false
                          ? 'Live selfie could not be confirmed'
                          : 'Verification is being processed'}
                    </Text>
                  </div>
                  {identityStatus === 'review_needed' ? (
                    <Text>This driver cannot be activated yet. Your operations team will review the case and take action.</Text>
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
