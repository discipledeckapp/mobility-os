'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  retryDriverVerificationAction,
  startDriverVerificationAction,
  type ResolveDriverVerificationActionState,
  type RetryDriverVerificationActionState,
  type SendDriverSelfServiceLinkActionState,
  type StartDriverVerificationActionState,
} from './actions';

const initialStartState: StartDriverVerificationActionState = {};
const initialResolveState: ResolveDriverVerificationActionState = {};
const initialSendState: SendDriverSelfServiceLinkActionState = {};
const initialRetryState: RetryDriverVerificationActionState = {};

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
  onVerificationSubmitted?: (
    result: NonNullable<ResolveDriverVerificationActionState['result']>,
  ) => void;
}) {
  const initialCountryCode = driver.nationality ?? defaultCountryCode ?? 'NG';
  const router = useRouter();
  const [isOpen] = useState(mode === 'self_service' || mode === 'guarantor_self_service');
  const [sendLinkPaysKyc, setSendLinkPaysKyc] = useState(driver.driverPaysKyc ?? orgDriverPaysKyc);
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
  const [retryState, retryFormAction, isRetrying] = useActionState(
    retryDriverVerificationAction.bind(null, driver.id),
    initialRetryState,
  );

  const [selfiePreviewUrl, setSelfiePreviewUrl] = useState<string | null>(null);
  const [selfieImageBase64, setSelfieImageBase64] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraGuidance, setCameraGuidance] = useState<string>('Position your face in the frame');
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0); // 0 = idle, 1–3 = capturing frame N
  // YouVerify web SDK state
  const [yvSdkError, setYvSdkError] = useState<string | null>(null);
  const [isLaunchingYv, setIsLaunchingYv] = useState(false);
  // Controlled consent state — persists across submission and cannot be silently reset.
  const [subjectConsent, setSubjectConsent] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const identityStatus = getDriverIdentityStatus(driver, resolveState.result);
  const session = startState.session;
  const result = resolveState.result;
  const identityTone = getDriverIdentityTone(identityStatus);
  const identityLabel = getDriverIdentityLabel(identityStatus);
  const canSendSelfServiceLink = Boolean(driver.email);
  const verificationFeeCopy = sendLinkPaysKyc
    ? 'Driver will pay the verification fee during self-service onboarding.'
    : 'Your organisation wallet will cover the verification fee for this driver.';

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
    if (mode === 'operator' && resolveState.result) {
      router.refresh();
    }
    if (mode !== 'operator' && resolveState.result && onVerificationSubmitted) {
      onVerificationSubmitted(resolveState.result);
    }
  }, [mode, onVerificationSubmitted, resolveState.result, router]);

  useEffect(() => {
    setSendLinkPaysKyc(driver.driverPaysKyc ?? orgDriverPaysKyc);
  }, [driver.driverPaysKyc, orgDriverPaysKyc]);

  // Log final verification result for audit / debugging.
  useEffect(() => {
    const r = resolveState.result;
    if (!r) return;
    console.info('[DriverVerification] verification result received', {
      decision: r.decision,
      isVerifiedMatch: r.isVerifiedMatch,
      providerName: r.providerName,
      providerLookupStatus: r.providerLookupStatus,
      livenessPassed: r.livenessPassed,
      livenessProviderName: r.livenessProviderName,
      livenessReason: r.livenessReason,
    });
  }, [resolveState.result]);

  // Instrumentation — log which liveness provider path is active.
  // Confirms whether YouVerify, Azure Face, Smile Identity, or internal_free_service
  // was selected by the backend when the session was initialised.
  useEffect(() => {
    if (!session) return;
    console.info('[DriverVerification] liveness session initialised', {
      providerName: session.providerName,
      sessionId: session.sessionId,
      expiresAt: session.expiresAt ?? null,
      hasClientAuthToken: Boolean(session.clientAuthToken),
      fallbackChain: session.fallbackChain,
    });
    if (session.providerName === 'youverify') {
      if (session.clientAuthToken) {
        console.info(
          '[DriverVerification] YouVerify SDK path active — clientAuthToken present. ' +
            'The youverify-liveness-web SDK will run on "Launch face verification".',
        );
      } else {
        console.error(
          '[DriverVerification] YouVerify session initialised but clientAuthToken is absent. ' +
            'This is a configuration error — YOUVERIFY_PUBLIC_MERCHANT_ID may be missing.',
        );
      }
    }
  }, [session]);

  // Attach stream after the container finishes expanding (fixes black screen on
  // mobile Safari/Chrome where play() into a zero-height element renders black).
  // We wait ~200 ms for the CSS max-h transition to settle before calling play().
  useEffect(() => {
    if (!cameraReady) return;
    const tid = setTimeout(() => {
      const video = videoRef.current;
      const stream = streamRef.current;
      if (!video || !stream) return;
      if (!video.srcObject) {
        video.srcObject = stream;
      }
      void video.play().catch(() => {});
    }, 200);
    return () => clearTimeout(tid);
  }, [cameraReady]);

  function stopStream(): void {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) track.stop();
      streamRef.current = null;
    }
  }

  async function launchYouVerifySDK(): Promise<void> {
    if (!session?.sessionId || !session?.clientAuthToken) return;
    setYvSdkError(null);
    setIsLaunchingYv(true);
    try {
      const { default: WebSDK } = await import('youverify-liveness-web');
      const sdk = new WebSDK({
        sessionId: session.sessionId,
        sessionToken: session.clientAuthToken,
        sandboxEnvironment: process.env.NODE_ENV !== 'production',
        presentation: 'modal',
        onSuccess(data) {
          const raw = data.faceImage ?? '';
          const isDataUrl = raw.startsWith('data:');
          const base64 = isDataUrl ? (raw.split(',')[1] ?? '') : raw;
          const preview = isDataUrl ? raw : `data:image/jpeg;base64,${raw}`;
          setSelfieImageBase64(base64);
          setSelfiePreviewUrl(preview);
          setIsLaunchingYv(false);
        },
        onFailure(data) {
          setYvSdkError(data.error?.message ?? 'Face verification failed. Please try again.');
          setIsLaunchingYv(false);
        },
        onClose() {
          setIsLaunchingYv(false);
        },
      });
      await sdk.start();
    } catch (err) {
      setYvSdkError(
        err instanceof Error ? err.message : 'Unable to load face verification. Please try again.',
      );
      setIsLaunchingYv(false);
    }
  }

  async function startCamera(): Promise<void> {
    setCameraError(null);
    setCameraGuidance('Position your face in the frame');
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        'Camera access is not available in this browser. Please use a modern browser over HTTPS.',
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      stopStream();
      streamRef.current = stream;
      // Do NOT call play() here — the video container is still max-h-0 at this point.
      // setCameraReady triggers the container to expand; the useEffect handles
      // attaching the stream and calling play() once the element has dimensions.
      setCameraReady(true);
    } catch (error) {
      if (error instanceof Error && error.name === 'NotAllowedError') {
        setCameraError(
          'Camera permission denied. Please allow camera access in your browser settings and try again.',
        );
      } else {
        setCameraError(error instanceof Error ? error.message : 'Unable to access the camera.');
      }
    }
  }

  function captureFrameWithVariance(video: HTMLVideoElement): {
    dataUrl: string;
    variance: number;
  } {
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
    if (!video) {
      setCameraError('Camera preview is not ready. Please open the camera again.');
      return;
    }

    const frames: { dataUrl: string; variance: number }[] = [];
    for (let i = 0; i < 3; i++) {
      setCaptureProgress(i + 1);
      frames.push(captureFrameWithVariance(video));
      if (i < 2) await new Promise<void>((resolve) => setTimeout(resolve, 800));
    }
    setCaptureProgress(0);

    // Pick the sharpest frame (highest pixel-luminance variance).
    const best = frames.reduce((a, b) => (a.variance >= b.variance ? a : b));
    if (!best.dataUrl) {
      setCameraError('Unable to capture the selfie image.');
      return;
    }

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
    setVideoPlaying(false);
    setCaptureProgress(0);
    setYvSdkError(null);
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
          <span
            title={
              canSendSelfServiceLink ? undefined : 'Add email address to send a self-service link.'
            }
          >
            <form action={sendLinkAction} className="flex flex-wrap items-center gap-2">
              <input name="driverId" type="hidden" value={driver.id} />
              <input name="driverPaysKycOverride" type="hidden" value={String(sendLinkPaysKyc)} />
              <label className="flex cursor-pointer items-start gap-2 text-xs text-slate-600 select-none">
                <input
                  checked={sendLinkPaysKyc}
                  className="size-3.5 accent-[var(--mobiris-primary)]"
                  onChange={(e) => setSendLinkPaysKyc(e.target.checked)}
                  type="checkbox"
                />
                <span className="space-y-0.5">
                  <span className="block font-medium text-slate-700">
                    Charge verification to driver
                  </span>
                  <span className="block text-slate-500">{verificationFeeCopy}</span>
                  {orgDriverPaysKyc !== sendLinkPaysKyc ? (
                    <span className="block text-amber-600">
                      This overrides the organisation default for this driver.
                    </span>
                  ) : null}
                </span>
              </label>
              <Button disabled={isSendingLink || !canSendSelfServiceLink} size="sm" type="submit">
                {isSendingLink ? 'Sending link...' : 'Request driver to self-verify'}
              </Button>
            </form>
          </span>
          <Button onClick={() => router.refresh()} size="sm" variant="ghost">
            Refresh verification status
          </Button>
          {driver.identityStatus === 'pending_verification' ? (
            <form action={retryFormAction}>
              <Button
                disabled={isRetrying}
                size="sm"
                title="Re-attempt provider lookup using the identifiers submitted by the driver. No additional charge."
                type="submit"
                variant="ghost"
              >
                {isRetrying ? 'Queuing retry...' : 'Retry provider lookup'}
              </Button>
            </form>
          ) : null}
        </div>
      ) : null}

      {mode === 'operator' && retryState.success ? (
        <Text tone="success">{retryState.success}</Text>
      ) : null}
      {mode === 'operator' && retryState.error ? (
        <Text tone="danger">{retryState.error}</Text>
      ) : null}
      {mode === 'operator' && retryState.notEligible ? (
        <Text tone="muted">
          Retry not available:{' '}
          {retryState.reason ?? 'driver is not in a provider-pending state.'}
        </Text>
      ) : null}

      {driver.identityReviewCaseId && !isOpen ? (
        <Text tone="muted">
          Review case {driver.identityReviewCaseId} is holding this driver until a manual decision
          is recorded.
        </Text>
      ) : null}
      {mode === 'operator' && sendState.error ? <Text tone="danger">{sendState.error}</Text> : null}
      {mode === 'operator' && sendState.success ? (
        <div className="space-y-2 rounded-[var(--mobiris-radius-card)] border border-emerald-200 bg-emerald-50/55 p-3">
          <Text tone="success">{sendState.success}</Text>
          {sendState.delivery ? (
            <>
              <Text tone="muted">
                Share the link directly with the driver using the buttons below.
              </Text>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(
                        sendState.delivery?.verificationUrl ?? '',
                      );
                    } catch {
                      // Ignore clipboard failures; the link remains visible.
                    }
                  }}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  Copy invite link
                </Button>
                {'share' in navigator ? (
                  <Button
                    onClick={() =>
                      void navigator.share({
                        title: 'Mobiris driver onboarding invite',
                        text: `Hello ${driver.firstName ?? 'Driver'},\n\nYou’ve been invited to join ${driver.organisationName ?? 'your organisation'} on Mobiris.\n\nClick the link below to create your account, complete verification, and get assigned to a vehicle.\n\n${sendState.delivery?.verificationUrl ?? ''}\n\nPlease complete this as soon as possible.`,
                        ...(sendState.delivery?.verificationUrl
                          ? { url: sendState.delivery.verificationUrl }
                          : {}),
                      })
                    }
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    Share
                  </Button>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      ) : null}
      {mode === 'operator' && !driver.email ? (
        <Text tone="muted">
          Add an email address to this driver record to send a self-verification link.
        </Text>
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
                : "Capture a live selfie, then enter the driver's identification numbers."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* ── Step 1: Liveness capture ── */}
            <div className="space-y-4 rounded-[var(--mobiris-radius-card)] border border-[var(--mobiris-border)] bg-white p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--mobiris-primary)] text-xs font-bold text-white">
                  1
                </div>
                <Text tone="strong">Face liveness capture</Text>
              </div>
              <Text tone="muted">
                {mode === 'self_service'
                  ? "Use this device's camera to capture a live selfie. Make sure your face is well-lit and centred."
                  : "Start a liveness session, then capture a selfie using this device's camera."}
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

              {/* Session active — YouVerify SDK path, hard error, or camera for other providers */}
              {session && !livenessDone ? (
                session.providerName === 'youverify' ? (
                  session.clientAuthToken ? (
                    /* YouVerify browser SDK — launches the native liveness modal */
                    <div className="space-y-3">
                      <Text tone="muted">
                        Click below to open the face verification window. Follow the on-screen
                        prompts to complete your liveness check.
                      </Text>
                      <Button
                        disabled={isLaunchingYv}
                        onClick={() => void launchYouVerifySDK()}
                        type="button"
                      >
                        {isLaunchingYv ? (
                          <span className="flex items-center gap-2">
                            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                            Opening…
                          </span>
                        ) : (
                          'Launch face verification'
                        )}
                      </Button>
                      {yvSdkError ? (
                        <div className="space-y-2">
                          <Text tone="danger">{yvSdkError}</Text>
                          <Button
                            onClick={() => setYvSdkError(null)}
                            size="sm"
                            type="button"
                            variant="ghost"
                          >
                            Try again
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    /* YouVerify session missing auth token — hard configuration error */
                    <div className="rounded-[var(--mobiris-radius-card)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      Face liveness verification is not available right now. Please contact support
                      or try again later.
                    </div>
                  )
                ) : (
                  /* Camera capture path — non-YouVerify providers (azure_face, smile_identity, etc.) */
                  <div className="space-y-3">
                    {/* Guidance text */}
                    <div className="rounded-[var(--mobiris-radius-card)] border border-blue-100 bg-blue-50/60 px-4 py-2.5 text-sm font-medium text-blue-700">
                      {cameraError ? '⚠ ' : '📷 '}
                      {cameraError ?? cameraGuidance}
                    </div>

                    {/* Video — always in DOM once session starts; hidden until stream ready.
                        Container uses max-h transition; stream is attached AFTER it expands
                        so the browser can render frames into an element with positive dimensions.
                        The face oval uses box-shadow to create a focused capture region. */}
                    <div
                      className={`relative overflow-hidden rounded-[var(--mobiris-radius-card)] border border-[var(--mobiris-border)] bg-slate-950 transition-all ${cameraReady ? `${mode === 'self_service' || mode === 'guarantor_self_service' ? 'max-h-[32rem] min-h-[22rem]' : 'max-h-[28rem] min-h-[20rem]'}` : 'max-h-0 border-0'}`}
                    >
                      <video
                        autoPlay
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                        ref={videoRef}
                        onPlaying={() => {
                          setVideoPlaying(true);
                          setCameraGuidance('Align your face with the oval, then capture');
                        }}
                      />
                      {/* Face oval guide — only rendered when video is actively playing */}
                      {cameraReady && videoPlaying ? (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                          <div className="h-56 w-44 rounded-full border-[3px] border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.38)]" />
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {!cameraReady ? (
                        <Button onClick={() => void startCamera()} type="button">
                          Open camera
                        </Button>
                      ) : !videoPlaying ? (
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-[var(--mobiris-primary)]" />
                          Starting camera…
                        </div>
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
                          <span className="text-sm text-slate-600">
                            Capturing {captureProgress}/3…
                          </span>
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
                )
              ) : null}

              {/* Selfie / liveness preview */}
              {selfiePreviewUrl && livenessDone ? (
                <div className="space-y-2 rounded-[var(--mobiris-radius-card)] border border-emerald-200 bg-emerald-50/50 p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-medium text-sm">
                      {session?.providerName === 'youverify'
                        ? '✓ Liveness verified'
                        : '✓ Selfie captured'}
                    </span>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Captured selfie preview"
                    className="max-h-40 rounded-[var(--mobiris-radius-card)] object-cover"
                    src={selfiePreviewUrl}
                  />
                  <Button onClick={resetSelfieCapture} type="button" variant="ghost" size="sm">
                    {session?.providerName === 'youverify' ? 'Redo verification' : 'Retake selfie'}
                  </Button>
                </div>
              ) : null}
            </div>

            {/* ── Step 2: Identification numbers (shown AFTER selfie captured) ── */}
            <div
              className={`space-y-4 rounded-[var(--mobiris-radius-card)] border p-4 transition-opacity ${livenessDone ? 'border-[var(--mobiris-border)] bg-white opacity-100' : 'border-slate-100 bg-slate-50/50 opacity-40 pointer-events-none'}`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${livenessDone ? 'bg-[var(--mobiris-primary)]' : 'bg-slate-300'}`}
                >
                  2
                </div>
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
                    const error = identifierTouched[idType.type]
                      ? identifierErrors[idType.type]
                      : null;
                    const hint = [
                      idType.exactLength ? `${idType.exactLength} digits` : null,
                      idType.numericOnly ? 'numbers only' : null,
                      idType.required ? 'required' : 'optional',
                    ]
                      .filter(Boolean)
                      .join(' · ');

                    return (
                      <div className="space-y-1.5" key={idType.type}>
                        <Label htmlFor={`${idType.type}-${driver.id}`}>
                          {idType.label}
                          {idType.required ? (
                            <span className="ml-1 text-rose-500">*</span>
                          ) : (
                            <span className="ml-1 text-slate-400">(optional)</span>
                          )}
                        </Label>
                        <Input
                          autoComplete="off"
                          id={`${idType.type}-${driver.id}`}
                          inputMode={idType.numericOnly ? 'numeric' : 'text'}
                          maxLength={idType.exactLength}
                          onBlur={() => markIdentifierTouched(idType.type)}
                          onChange={(e) => {
                            const raw = idType.numericOnly
                              ? e.target.value.replace(/\D/g, '')
                              : e.target.value;
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
                      <Text tone="success">
                        Identification numbers look good — proceed to submit below.
                      </Text>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* ── Step 3: Consent + Submit ── */}
            <form
              action={resolveFormAction}
              className="space-y-4 rounded-[var(--mobiris-radius-card)] border border-[var(--mobiris-border)] bg-white p-4"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${livenessDone && idPhaseComplete ? 'bg-[var(--mobiris-primary)]' : 'bg-slate-300'}`}
                >
                  3
                </div>
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

              {/* Submission result — shown in place of the submit action once resolved */}
              {result ? (
                <div className="space-y-3 rounded-[var(--mobiris-radius-card)] border border-[var(--mobiris-border)] bg-[var(--mobiris-primary-tint)] p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={identityTone}>{identityLabel}</Badge>
                  </div>
                  <Text>
                    {identityStatus === 'verified'
                      ? 'Verification successful. Loading next step…'
                      : identityStatus === 'review_needed'
                        ? 'Your verification has been submitted and is under manual review. You will be notified of the outcome.'
                        : identityStatus === 'failed'
                          ? 'Verification could not be completed. Your payment entitlement is preserved. Contact your organisation if you need assistance.'
                          : 'Verification submitted. Loading next step…'}
                  </Text>
                  {mode === 'self_service' || mode === 'guarantor_self_service' ? (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-[var(--mobiris-primary)]" />
                      <span>Please wait…</span>
                    </div>
                  ) : null}
                  {mode === 'operator' && identityStatus === 'review_needed' ? (
                    <Text tone="muted">
                      Your operations team will review the case and take action.
                    </Text>
                  ) : null}
                </div>
              ) : (
                <>
                  <Text tone="muted">
                    {!livenessDone
                      ? 'Complete the face capture in step 1 before submitting.'
                      : !idPhaseComplete
                        ? 'Enter your identification number in step 2 before submitting.'
                        : subjectConsent
                          ? 'Ready to submit your verification.'
                          : 'Confirm consent below to enable submission.'}
                  </Text>

                  {/* Controlled consent checkbox — state persists across form resets */}
                  <label className="flex cursor-pointer items-start gap-3 rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/70 p-3 text-sm text-slate-700 transition-colors hover:bg-slate-100/70 select-none">
                    <input
                      checked={subjectConsent}
                      className="mt-0.5 size-4 accent-[var(--mobiris-primary)]"
                      name="subjectConsent"
                      onChange={(e) => setSubjectConsent(e.target.checked)}
                      type="checkbox"
                    />
                    <span>
                      {mode === 'guarantor_self_service' || mode === 'self_service'
                        ? 'I consent to my identity documents and live selfie being processed for verification purposes.'
                        : 'I confirm the driver has given consent for identity and liveness verification.'}
                    </span>
                  </label>

                  {mode === 'self_service' || mode === 'guarantor_self_service' ? (
                    <Text tone="muted">
                      By submitting you agree to the{' '}
                      <a
                        className="font-semibold text-[var(--mobiris-primary)] underline"
                        href="/terms"
                        rel="noreferrer"
                        target="_blank"
                      >
                        Terms of Use
                      </a>{' '}
                      and{' '}
                      <a
                        className="font-semibold text-[var(--mobiris-primary)] underline"
                        href="/privacy"
                        rel="noreferrer"
                        target="_blank"
                      >
                        Privacy Policy
                      </a>
                      .
                    </Text>
                  ) : null}

                  <Button
                    disabled={
                      !livenessDone ||
                      !idPhaseComplete ||
                      isResolving ||
                      !session ||
                      !subjectConsent
                    }
                    type="submit"
                  >
                    {isResolving ? (
                      <span className="flex items-center gap-2">
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Submitting…
                      </span>
                    ) : (
                      'Submit verification'
                    )}
                  </Button>

                  {resolveState.error ? (
                    <Text tone="danger">
                      {mode === 'self_service' || mode === 'guarantor_self_service'
                        ? sanitizeSelfServiceError(resolveState.error)
                        : resolveState.error}
                    </Text>
                  ) : null}
                </>
              )}
            </form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
