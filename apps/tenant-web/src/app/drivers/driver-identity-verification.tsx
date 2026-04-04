'use client';

import {
  type SupportedIdentifierType,
  getCountryConfig,
  getSupportedCountryCodes,
  isCountrySupported,
} from '@mobility-os/domain-config';
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
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DriverRecord } from '../../lib/api-core';
import type { DriverIdentityResolutionResult } from '../../lib/api-core';
import {
  getDriverIdentityLabel,
  getDriverIdentityStatus,
  getDriverIdentityTone,
} from '../../lib/driver-identity';
import {
  type ResolveDriverVerificationActionState,
  type RetryDriverVerificationActionState,
  type SendDriverSelfServiceLinkActionState,
  type StartDriverVerificationActionState,
  resolveDriverSelfServiceVerificationAction,
  resolveDriverVerificationAction,
  resolveGuarantorSelfServiceVerificationAction,
  retryDriverVerificationAction,
  sendDriverSelfServiceLinkAction,
  startDriverSelfServiceVerificationAction,
  startDriverVerificationAction,
  startGuarantorSelfServiceVerificationAction,
} from './actions';

type YouVerifySdkModule = typeof import('youverify-liveness-web');
type YouVerifyLivenessData = Parameters<
  NonNullable<ConstructorParameters<YouVerifySdkModule['default']>[0]['onSuccess']>
>[0];

const initialStartState: StartDriverVerificationActionState = {};
const initialResolveState: ResolveDriverVerificationActionState = {};
const initialSendState: SendDriverSelfServiceLinkActionState = {};
const initialRetryState: RetryDriverVerificationActionState = {};
const VERIFICATION_TIER_OPTIONS = [
  { value: 'BASIC_IDENTITY', label: 'Basic Identity' },
  { value: 'VERIFIED_IDENTITY', label: 'Verified Identity' },
  { value: 'FULL_TRUST_VERIFICATION', label: 'Full Trust Verification' },
] as const;

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

function getDisplayIdentityName(
  result?: DriverIdentityResolutionResult['verifiedProfile'],
): string | null {
  if (!result) return null;
  if (result.fullName?.trim()) return result.fullName.trim();
  const joined = [result.firstName, result.middleName, result.lastName]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(' ')
    .trim();
  return joined.length > 0 ? joined : null;
}

function getBlobObjectUrl(value: string | null): string | null {
  return typeof value === 'string' && value.startsWith('blob:') ? value : null;
}

function normalizeCapturedSelfie(rawValue?: string | null): {
  previewUrl: string | null;
  selfieImageBase64: string;
  selfieImageUrl: string;
} {
  const trimmed = rawValue?.trim() ?? '';

  if (!trimmed) {
    return {
      previewUrl: null,
      selfieImageBase64: '',
      selfieImageUrl: '',
    };
  }

  if (trimmed.startsWith('data:')) {
    return {
      previewUrl: trimmed,
      selfieImageBase64: trimmed.split(',')[1] ?? '',
      selfieImageUrl: '',
    };
  }

  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('blob:') || trimmed.startsWith('file://')) {
    return {
      previewUrl: trimmed,
      selfieImageBase64: '',
      selfieImageUrl: trimmed,
    };
  }

  return {
    previewUrl: `data:image/jpeg;base64,${trimmed}`,
    selfieImageBase64: trimmed,
    selfieImageUrl: '',
  };
}

function maskSensitiveValue(value?: string | null): string {
  const trimmed = value?.trim() ?? '';
  if (trimmed.length <= 4) {
    return trimmed;
  }
  return `${'*'.repeat(Math.max(0, trimmed.length - 4))}${trimmed.slice(-4)}`;
}

function getBrowserLivenessSupport() {
  if (typeof window === 'undefined') {
    return {
      supported: true,
      warnings: [] as string[],
      startError: null as string | null,
      isWindows: false,
    };
  }

  const ua = window.navigator.userAgent;
  const isWindows = /Windows/i.test(ua);
  const isFirefox = /Firefox/i.test(ua);
  const isSecure = window.isSecureContext;
  const supportsCamera = Boolean(window.navigator.mediaDevices?.getUserMedia);
  const warnings: string[] = [];

  if (isWindows && isFirefox) {
    warnings.push('Windows Firefox can be unreliable for camera capture. Chrome or Edge works better.');
  }
  if (isWindows) {
    warnings.push('If camera access is blocked, recheck browser site permissions and Windows privacy settings.');
  }

  if (!isSecure) {
    return {
      supported: false,
      warnings,
      startError: 'Camera access requires a secure HTTPS session in this browser.',
      isWindows,
    };
  }

  if (!supportsCamera) {
    return {
      supported: false,
      warnings,
      startError: 'This browser does not expose camera capture. Try a current version of Chrome, Edge, or Safari.',
      isWindows,
    };
  }

  return {
    supported: true,
    warnings,
    startError: null,
    isWindows,
  };
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
  const getTierRank = (
    tier: 'BASIC_IDENTITY' | 'VERIFIED_IDENTITY' | 'FULL_TRUST_VERIFICATION',
  ) => (tier === 'FULL_TRUST_VERIFICATION' ? 3 : tier === 'VERIFIED_IDENTITY' ? 2 : 1);
  const initialCountryCode = driver.nationality ?? defaultCountryCode ?? 'NG';
  const router = useRouter();
  const [isOpen] = useState(mode === 'self_service' || mode === 'guarantor_self_service');
  const [sendLinkPaysKyc, setSendLinkPaysKyc] = useState(driver.driverPaysKyc ?? orgDriverPaysKyc);
  const [selectedVerificationTier, setSelectedVerificationTier] = useState<
    'BASIC_IDENTITY' | 'VERIFIED_IDENTITY' | 'FULL_TRUST_VERIFICATION'
  >(driver.verificationTier ?? 'BASIC_IDENTITY');
  const organisationMinimumTier = driver.verificationTier ?? 'BASIC_IDENTITY';
  const [forceReverification, setForceReverification] = useState(false);
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset identifier state when the selected country changes.
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
  const [selfieImageUrl, setSelfieImageUrl] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraGuidance, setCameraGuidance] = useState<string>('Position your face in the frame');
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0); // 0 = idle, 1–3 = capturing frame N
  // YouVerify web SDK state
  const [yvSdkError, setYvSdkError] = useState<string | null>(null);
  const [isLaunchingYv, setIsLaunchingYv] = useState(false);
  const [autoLaunchYv, setAutoLaunchYv] = useState(false);
  const [livenessLoadingProgress, setLivenessLoadingProgress] = useState(0);
  const [submitLoadingProgress, setSubmitLoadingProgress] = useState(0);
  const [browserWarnings, setBrowserWarnings] = useState<string[]>([]);
  // Controlled consent state — persists across submission and cannot be silently reset.
  const [subjectConsent, setSubjectConsent] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const launchedSessionRef = useRef<string | null>(null);
  const youVerifySdkPromiseRef = useRef<Promise<YouVerifySdkModule> | null>(null);

  const identityStatus = getDriverIdentityStatus(driver, resolveState.result);
  const session = startState.session;
  const result = resolveState.result;
  const identityTone = getDriverIdentityTone(identityStatus);
  const identityLabel = getDriverIdentityLabel(identityStatus);
  const shouldAdvanceAfterResult = Boolean(
    result &&
      (result.providerPending === true ||
        Boolean(result.personId) ||
        result.decision === 'review_required'),
  );
  const canSendSelfServiceLink = Boolean(driver.email);
  const verificationTierLabel = driver.verificationTierLabel ?? 'Basic Identity';
  const formattedVerificationAmount =
    driver.verificationAmountMinorUnits && driver.verificationCurrency
      ? new Intl.NumberFormat(driver.verificationCurrency === 'NGN' ? 'en-NG' : 'en-US', {
          style: 'currency',
          currency: driver.verificationCurrency,
          minimumFractionDigits: 2,
        }).format(driver.verificationAmountMinorUnits / 100)
      : null;
  const selectedVerificationTierLabel =
    VERIFICATION_TIER_OPTIONS.find((option) => option.value === selectedVerificationTier)?.label ??
    verificationTierLabel;
  const formattedSelectedVerificationAmount =
    selectedVerificationTier === driver.verificationTier ? formattedVerificationAmount : null;
  const verificationFeeCopy = sendLinkPaysKyc
    ? `Driver will pay ${formattedSelectedVerificationAmount ?? 'the selected tier price'} for ${selectedVerificationTierLabel} during self-service onboarding.`
    : `Your organisation wallet or approved credit will cover ${selectedVerificationTierLabel}${formattedSelectedVerificationAmount ? ` (${formattedSelectedVerificationAmount})` : ''} for this driver.`;
  const canRequestFreshVerification =
    mode === 'operator' &&
    (driver.identityStatus !== 'unverified' ||
      Boolean(driver.identityLastVerifiedAt) ||
      Boolean(driver.identityReviewCaseId) ||
      Boolean(driver.identityProfile) ||
      Boolean(driver.reverificationRequired));
  const rawPersistedSelfieSeed =
    driver.selfieImageUrl?.trim() ||
    driver.identityProfile?.selfieImageUrl?.trim() ||
    null;
  const persistedSelfieSeed =
    mode === 'self_service' && selfServiceToken
      ? `/api/driver-self-service/identity-image/selfie?token=${encodeURIComponent(selfServiceToken)}`
      : mode === 'guarantor_self_service' && selfServiceToken
        ? `/api/guarantor-self-service/identity-image/selfie?token=${encodeURIComponent(selfServiceToken)}`
        : rawPersistedSelfieSeed;

  // Selfie captured = liveness step done; identifier phase = step 2
  const livenessDone = Boolean(selfieImageBase64 || selfieImageUrl);
  const isPreparingYouVerify =
    !livenessDone &&
    (isStarting ||
      autoLaunchYv ||
      isLaunchingYv ||
      (session?.providerName === 'youverify' &&
        Boolean(session.clientAuthToken) &&
        launchedSessionRef.current !== session.sessionId));
  const showLivenessLoadingModal = session?.providerName === 'youverify' && isPreparingYouVerify;
  const showSubmitLoadingModal = isResolving && !result;

  useEffect(() => {
    return () => {
      const previewUrl = getBlobObjectUrl(selfiePreviewUrl);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [selfiePreviewUrl]);

  useEffect(() => {
    if (!persistedSelfieSeed || selfieImageBase64 || selfieImageUrl || selfiePreviewUrl) {
      return;
    }

    const normalizedSelfie = normalizeCapturedSelfie(persistedSelfieSeed);
    setSelfieImageBase64(normalizedSelfie.selfieImageBase64);
    setSelfieImageUrl(normalizedSelfie.selfieImageUrl);
    setSelfiePreviewUrl(normalizedSelfie.previewUrl);
  }, [persistedSelfieSeed, selfieImageBase64, selfieImageUrl, selfiePreviewUrl]);

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  useEffect(() => {
    if (getTierRank(selectedVerificationTier) < getTierRank(organisationMinimumTier)) {
      setSelectedVerificationTier(organisationMinimumTier);
    }
  }, [organisationMinimumTier, selectedVerificationTier]);

  useEffect(() => {
    if (!showLivenessLoadingModal) {
      setLivenessLoadingProgress(0);
      return;
    }

    setLivenessLoadingProgress((current) => (current > 0 ? current : 8));
    const interval = setInterval(() => {
      setLivenessLoadingProgress((current) => {
        if (current >= 92) {
          return current;
        }
        if (current < 35) {
          return current + 9;
        }
        if (current < 70) {
          return current + 6;
        }
        return current + 3;
      });
    }, 220);

    return () => clearInterval(interval);
  }, [showLivenessLoadingModal]);

  useEffect(() => {
    if (!showSubmitLoadingModal) {
      setSubmitLoadingProgress(0);
      return;
    }

    setSubmitLoadingProgress((current) => (current > 0 ? current : 12));
    const interval = setInterval(() => {
      setSubmitLoadingProgress((current) => {
        if (current >= 94) {
          return current;
        }
        if (current < 45) {
          return current + 8;
        }
        if (current < 72) {
          return current + 5;
        }
        return current + 2;
      });
    }, 240);

    return () => clearInterval(interval);
  }, [showSubmitLoadingModal]);

  useEffect(() => {
    if (mode === 'operator' && resolveState.result) {
      router.refresh();
    }
    if (mode !== 'operator' && shouldAdvanceAfterResult && resolveState.result && onVerificationSubmitted) {
      onVerificationSubmitted(resolveState.result);
    }
  }, [mode, onVerificationSubmitted, resolveState.result, router, shouldAdvanceAfterResult]);

  useEffect(() => {
    setSendLinkPaysKyc(driver.driverPaysKyc ?? orgDriverPaysKyc);
  }, [driver.driverPaysKyc, orgDriverPaysKyc]);

  useEffect(() => {
    setSelectedVerificationTier(driver.verificationTier ?? 'BASIC_IDENTITY');
  }, [driver.verificationTier]);

  useEffect(() => {
    setForceReverification(Boolean(driver.reverificationRequired));
  }, [driver.reverificationRequired]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    youVerifySdkPromiseRef.current ??= import('youverify-liveness-web');
    setBrowserWarnings(getBrowserLivenessSupport().warnings);
  }, []);

  useEffect(() => {
    if (startState.error) {
      setAutoLaunchYv(false);
      launchedSessionRef.current = null;
    }
  }, [startState.error]);

  const youVerifySandboxEnvironment = (() => {
    const raw = process.env.NEXT_PUBLIC_YOUVERIFY_SANDBOX?.trim().toLowerCase();
    return raw === '1' || raw === 'true' || raw === 'yes' || raw === 'on';
  })();
  const youVerifyTasks = useMemo(
    () => [
      {
        id: 'blink' as const,
        difficulty: 'easy' as const,
        maxBlinks: 1,
        timeout: 30_000,
      },
    ],
    [],
  );

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

  const launchYouVerifySDK = useCallback(async (): Promise<void> => {
    if (!session?.sessionId || !session?.clientAuthToken) return;
    if (session.expiresAt && new Date(session.expiresAt).getTime() <= Date.now() + 5_000) {
      setYvSdkError('Your face verification session expired before it could open. Start again.');
      setAutoLaunchYv(false);
      setIsLaunchingYv(false);
      launchedSessionRef.current = null;
      return;
    }
    setYvSdkError(null);
    setIsLaunchingYv(true);
    launchedSessionRef.current = session.sessionId;
    try {
      const { default: WebSDK } = await (youVerifySdkPromiseRef.current ??
        import('youverify-liveness-web'));
      const sdk = new WebSDK({
        sessionId: session.sessionId,
        sessionToken: session.clientAuthToken,
        sandboxEnvironment: youVerifySandboxEnvironment,
        tasks: youVerifyTasks,
        presentation: 'modal',
        onSuccess(data: YouVerifyLivenessData) {
          const normalizedSelfie = normalizeCapturedSelfie(data.faceImage);
          setSelfieImageBase64(normalizedSelfie.selfieImageBase64);
          setSelfieImageUrl(normalizedSelfie.selfieImageUrl);
          setSelfiePreviewUrl(normalizedSelfie.previewUrl);
          setAutoLaunchYv(false);
          setLivenessLoadingProgress(100);
          setIsLaunchingYv(false);
        },
        onFailure(data: YouVerifyLivenessData) {
          setYvSdkError(data.error?.message ?? 'Face verification failed. Please try again.');
          setAutoLaunchYv(false);
          setIsLaunchingYv(false);
        },
        onClose() {
          setAutoLaunchYv(false);
          setIsLaunchingYv(false);
        },
      });
      await sdk.start();
    } catch (err) {
      setYvSdkError(
        err instanceof Error ? err.message : 'Unable to load face verification. Please try again.',
      );
      setAutoLaunchYv(false);
      setIsLaunchingYv(false);
    }
  }, [session, youVerifySandboxEnvironment, youVerifyTasks]);

  useEffect(() => {
    if (
      !autoLaunchYv ||
      !session?.sessionId ||
      !session?.clientAuthToken ||
      session.providerName !== 'youverify' ||
      launchedSessionRef.current === session.sessionId ||
      livenessDone
    ) {
      return;
    }

    void launchYouVerifySDK();
  }, [autoLaunchYv, livenessDone, launchYouVerifySDK, session]);

  async function startCamera(): Promise<void> {
    setCameraError(null);
    setCameraGuidance('Position your face in the frame');
    const support = getBrowserLivenessSupport();
    if (!support.supported) {
      setCameraError(support.startError);
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
    const previewUrl = getBlobObjectUrl(selfiePreviewUrl);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelfieImageBase64(base64);
    setSelfieImageUrl('');
    setSelfiePreviewUrl(best.dataUrl);
    setCameraReady(false);
    stopStream();
  }

  function resetSelfieCapture(): void {
    stopStream();
    const previewUrl = getBlobObjectUrl(selfiePreviewUrl);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelfiePreviewUrl(null);
    setSelfieImageBase64('');
    setSelfieImageUrl('');
    setCameraError(null);
    setCameraReady(false);
    setVideoPlaying(false);
    setCaptureProgress(0);
    setYvSdkError(null);
    setAutoLaunchYv(false);
    launchedSessionRef.current = null;
  }

  function updateIdentifierValue(type: string, value: string): void {
    setIdentifierValues((current) => ({ ...current, [type]: value }));
  }

  function markIdentifierTouched(type: string): void {
    setIdentifierTouched((current) => ({ ...current, [type]: true }));
  }

  return (
    <div className="space-y-4">
      {showLivenessLoadingModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[var(--mobiris-radius-card)] border border-white/10 bg-white p-6 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.75)]">
            <div className="space-y-4">
              <div className="space-y-1">
                <Text tone="strong">Preparing face verification</Text>
                <Text tone="muted">
                  {isStarting
                    ? 'Creating your secure verification session...'
                    : 'Opening the camera check window...'}
                </Text>
              </div>
              <div className="space-y-2">
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[var(--mobiris-primary)] transition-[width] duration-200 ease-out"
                    style={{ width: `${livenessLoadingProgress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Please keep this tab open</span>
                  <span>{livenessLoadingProgress}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {showSubmitLoadingModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[var(--mobiris-radius-card)] border border-white/10 bg-white p-6 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.75)]">
            <div className="space-y-4">
              <div className="space-y-1">
                <Text tone="strong">Submitting identity verification</Text>
                <Text tone="muted">
                  Comparing your live selfie and identifier details with the verification provider.
                </Text>
              </div>
              <div className="space-y-2">
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[var(--mobiris-primary)] transition-[width] duration-200 ease-out"
                    style={{ width: `${submitLoadingProgress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Please keep this tab open</span>
                  <span>{submitLoadingProgress}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
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
              <input name="verificationTierOverride" type="hidden" value={selectedVerificationTier} />
              <input name="forceReverification" type="hidden" value={String(forceReverification)} />
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
              <label className="flex flex-col gap-1 text-xs text-slate-600">
                <span className="font-medium text-slate-700">Verification tier for this driver</span>
                <select
                  className="min-w-[190px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  onChange={(event) =>
                    setSelectedVerificationTier(
                      event.target.value as
                        | 'BASIC_IDENTITY'
                        | 'VERIFIED_IDENTITY'
                        | 'FULL_TRUST_VERIFICATION',
                    )
                  }
                  value={selectedVerificationTier}
                >
                  {VERIFICATION_TIER_OPTIONS.map((option) => (
                    <option
                      disabled={getTierRank(option.value) < getTierRank(organisationMinimumTier)}
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              {canRequestFreshVerification ? (
                <label className="flex cursor-pointer items-start gap-2 text-xs text-slate-600 select-none">
                  <input
                    checked={forceReverification}
                    className="mt-0.5 size-3.5 accent-[var(--mobiris-primary)]"
                    onChange={(event) => setForceReverification(event.target.checked)}
                    type="checkbox"
                  />
                  <span className="space-y-0.5">
                    <span className="block font-medium text-slate-700">
                      Request fresh re-verification
                    </span>
                    <span className="block text-slate-500">
                      The driver will repeat verification at the selected tier, and the new
                      verified details will replace the current record.
                    </span>
                  </span>
                </label>
              ) : null}
              <Button disabled={isSendingLink || !canSendSelfServiceLink} size="sm" type="submit">
                {isSendingLink
                  ? 'Sending link...'
                  : forceReverification
                    ? 'Request driver re-verification'
                    : 'Request driver to self-verify'}
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
          Retry not available: {retryState.reason ?? 'driver is not in a provider-pending state.'}
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
              {browserWarnings.map((warning) => (
                <Text key={warning} tone="muted">
                  {warning}
                </Text>
              ))}

              {/* Start session form */}
              {!session && !livenessDone ? (
                <form action={startFormAction} className="space-y-3">
                  {mode === 'self_service' || mode === 'guarantor_self_service' ? (
                    <input name="token" type="hidden" value={selfServiceToken ?? ''} />
                  ) : (
                    <input name="driverId" type="hidden" value={driver.id} />
                  )}
                  <input name="countryCode" type="hidden" value={countryCode} />
                  <Button
                    disabled={isStarting}
                    onClick={(event) => {
                      const support = getBrowserLivenessSupport();
                      if (!support.supported) {
                        event.preventDefault();
                        setYvSdkError(support.startError);
                        setAutoLaunchYv(false);
                        return;
                      }
                      setYvSdkError(null);
                      setAutoLaunchYv(true);
                    }}
                    type="submit"
                  >
                    {isStarting ? 'Preparing face verification...' : 'Start face verification'}
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
                        Your face verification window opens automatically after the secure session
                        is prepared.
                      </Text>
                      {session.expiresAt ? (
                        <Text tone="muted">
                          Session expires at {new Date(session.expiresAt).toLocaleTimeString()}.
                        </Text>
                      ) : null}
                      {yvSdkError ? (
                        <div className="space-y-2">
                          <Text tone="danger">{yvSdkError}</Text>
                          <Button
                            onClick={() => {
                              setYvSdkError(null);
                              setAutoLaunchYv(true);
                              launchedSessionRef.current = null;
                              void launchYouVerifySDK();
                            }}
                            size="sm"
                            type="button"
                            variant="secondary"
                          >
                            Retry face verification
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
                  {mode === 'operator' ? (
                    <Button onClick={resetSelfieCapture} size="sm" type="button" variant="ghost">
                      {session?.providerName === 'youverify'
                        ? 'Capture a different selfie'
                        : 'Retake selfie'}
                    </Button>
                  ) : (
                    <Text tone="muted">
                      Liveness is already saved for this session. Continue below to avoid an
                      unnecessary repeat verification.
                    </Text>
                  )}
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
              <input name="selfieImageUrl" type="hidden" value={selfieImageUrl} />
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
                    {result.verificationMetadata?.matchScore !== undefined ? (
                      <Badge tone={identityStatus === 'verified' ? 'success' : 'warning'}>
                        Match score {result.verificationMetadata.matchScore}%
                      </Badge>
                    ) : null}
                  </div>
                  <Text>
                    {result.providerPending
                      ? 'Your verification request was submitted successfully, but the provider result is still being recovered. Please wait for the saved result to refresh.'
                      : shouldAdvanceAfterResult && identityStatus === 'verified'
                        ? 'Verification successful. Loading next step…'
                        : identityStatus === 'review_needed'
                          ? 'Your verification has been submitted and is under manual review. You will be notified of the outcome.'
                          : mode === 'guarantor_self_service'
                            ? 'The returned identity could not be confirmed as this guarantor. Check the NIN and try again.'
                          : identityStatus === 'failed'
                            ? 'Verification could not be completed. Your payment entitlement is preserved. Contact your organisation if you need assistance.'
                            : 'Verification submitted. Loading next step…'}
                  </Text>
                  {getDisplayIdentityName(result.verifiedProfile) ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1">
                        <Text tone="muted">Returned identity</Text>
                        <Text>{getDisplayIdentityName(result.verifiedProfile)}</Text>
                      </div>
                      {result.verifiedProfile?.ninIdNumber ? (
                        <div className="space-y-1">
                          <Text tone="muted">NIN</Text>
                          <Text>{maskSensitiveValue(result.verifiedProfile.ninIdNumber)}</Text>
                        </div>
                      ) : null}
                      {result.verifiedProfile?.dateOfBirth ? (
                        <div className="space-y-1">
                          <Text tone="muted">Date of birth</Text>
                          <Text>{result.verifiedProfile.dateOfBirth}</Text>
                        </div>
                      ) : null}
                      {result.verifiedProfile?.gender ? (
                        <div className="space-y-1">
                          <Text tone="muted">Gender</Text>
                          <Text>{result.verifiedProfile.gender}</Text>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  {(mode === 'self_service' || mode === 'guarantor_self_service') &&
                  shouldAdvanceAfterResult ? (
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
                      !subjectConsent
                    }
                    type="submit"
                  >
                    {isResolving ? 'Submitting verification...' : 'Submit verification'}
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
