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
  resolveDriverVerificationAction,
  resolveDriverSelfServiceVerificationAction,
  startDriverVerificationAction,
  type ResolveDriverVerificationActionState,
  type SendDriverSelfServiceLinkActionState,
  type StartDriverVerificationActionState,
} from './actions';

const initialStartState: StartDriverVerificationActionState = {};
const initialResolveState: ResolveDriverVerificationActionState = {};
const initialSendState: SendDriverSelfServiceLinkActionState = {};

function VerificationStepIndicator({
  current,
}: {
  current: 1 | 2 | 3;
}) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
      {[1, 2, 3].map((step) => (
        <div className="flex items-center gap-2" key={step}>
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full ${
              step === current
                ? 'bg-[var(--mobiris-primary)] text-white'
                : step < current
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 text-slate-500'
            }`}
          >
            {step}
          </div>
          {step < 3 ? <div className="h-px w-8 bg-slate-200" /> : null}
        </div>
      ))}
      <span className="ml-2 text-slate-400">Step {current} of 3</span>
    </div>
  );
}

function getIdentifierOptions(countryCode: string): Array<{ value: string; label: string }> {
  if (!isCountrySupported(countryCode)) return [];
  return getCountryConfig(countryCode).supportedIdentifierTypes.map((id) => ({
    value: id.type,
    label: id.label,
  }));
}

function getIdentifierPlaceholder(optionLabel: string): string {
  if (optionLabel.includes('NIN')) return 'Enter the driver NIN';
  if (optionLabel.includes('BVN')) return 'Enter the driver BVN';
  if (optionLabel.includes('Phone')) return 'Phone is already on the driver record';
  return `Enter ${optionLabel}`;
}

export function DriverIdentityVerification({
  driver,
  defaultCountryCode,
  mode = 'operator',
  selfServiceToken,
}: {
  driver: DriverRecord;
  defaultCountryCode?: string | null;
  mode?: 'operator' | 'self_service';
  selfServiceToken?: string | null;
}) {
  const initialCountryCode = driver.nationality ?? defaultCountryCode ?? 'NG';
  const [isOpen, setIsOpen] = useState(mode === 'self_service');
  const [countryCode, setCountryCode] = useState(initialCountryCode);
  const countryOptions = useMemo(
    () =>
      getSupportedCountryCodes().map((code) => ({
        value: code,
        label: getCountryConfig(code).name,
      })),
    [],
  );
  const identifierOptions = useMemo(() => getIdentifierOptions(countryCode), [countryCode]);
  const manualIdentifierOptions = useMemo(
    () => identifierOptions.filter((option) => option.value !== 'PHONE' && option.value !== 'EMAIL'),
    [identifierOptions],
  );
  const [sendState, sendLinkAction, isSendingLink] = useActionState(
    sendDriverSelfServiceLinkAction,
    initialSendState,
  );
  const [startState, startFormAction, isStarting] = useActionState(
    mode === 'self_service'
      ? startDriverSelfServiceVerificationAction
      : startDriverVerificationAction,
    initialStartState,
  );
  const [resolveState, resolveFormAction, isResolving] = useActionState(
    mode === 'self_service'
      ? resolveDriverSelfServiceVerificationAction
      : resolveDriverVerificationAction,
    initialResolveState,
  );
  const [selfiePreviewUrl, setSelfiePreviewUrl] = useState<string | null>(null);
  const [selfieImageBase64, setSelfieImageBase64] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [identifierValues, setIdentifierValues] = useState<Record<string, string>>({});
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
  const currentStep: 1 | 2 | 3 = isManualMode
    ? result
      ? 3
      : 2
    : !startState.session
      ? 1
      : !selfieImageBase64
        ? 2
        : 3;

  useEffect(() => {
    return () => {
      if (selfiePreviewUrl) {
        URL.revokeObjectURL(selfiePreviewUrl);
      }

      if (streamRef.current) {
        for (const track of streamRef.current.getTracks()) {
          track.stop();
        }
      }
    };
  }, [selfiePreviewUrl]);

  useEffect(() => {
    if (isManualMode || !session || cameraReady || selfiePreviewUrl || streamRef.current) {
      return;
    }

    void startCamera();
  }, [cameraReady, isManualMode, selfiePreviewUrl, session]);

  async function startCamera(): Promise<void> {
    setCameraError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('This browser cannot access the camera for live selfie capture.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });

      if (streamRef.current) {
        for (const track of streamRef.current.getTracks()) {
          track.stop();
        }
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);
    } catch (error) {
      setCameraError(
        error instanceof Error
          ? error.message
          : 'Unable to access the camera for live selfie capture.',
      );
    }
  }

  function captureSelfie(): void {
    if (!videoRef.current) {
      setCameraError('Camera preview is not ready yet.');
      return;
    }

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const context = canvas.getContext('2d');

    if (!context) {
      setCameraError('Unable to capture the selfie image.');
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const [, base64 = ''] = dataUrl.split(',');

    if (selfiePreviewUrl) {
      URL.revokeObjectURL(selfiePreviewUrl);
    }

    setSelfieImageBase64(base64);
    setSelfiePreviewUrl(dataUrl);
    setCameraReady(false);

    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
  }

  function resetSelfieCapture(): void {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
    if (selfiePreviewUrl) {
      URL.revokeObjectURL(selfiePreviewUrl);
    }
    setSelfiePreviewUrl(null);
    setSelfieImageBase64('');
    setCameraError(null);
    setCameraReady(false);
  }

  function updateIdentifierValue(identifierType: string, value: string): void {
    setIdentifierValues((current) => ({
      ...current,
      [identifierType]: value,
    }));
  }

  return (
    <div className="space-y-4">
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
              canSendSelfServiceLink
                ? undefined
                : 'Add email address to send a self-service link.'
            }
          >
            <form action={sendLinkAction}>
              <input name="driverId" type="hidden" value={driver.id} />
              <Button
                disabled={isSendingLink || !canSendSelfServiceLink}
                size="sm"
                type="submit"
                variant="ghost"
              >
                {isSendingLink ? 'Sending link...' : 'Request driver to self-verify'}
              </Button>
            </form>
          </span>
          <Button
            onClick={() => setIsOpen((current) => !current)}
            size="sm"
            variant="secondary"
          >
            {isOpen ? 'Hide verification' : identityStatus === 'verified' ? 'Re-verify identity' : 'Verify identity'}
          </Button>
        </div>
      ) : null}

      {driver.identityReviewCaseId && !isOpen ? (
        <Text tone="muted">
          Review case {driver.identityReviewCaseId} is holding this driver until a manual decision is recorded.
        </Text>
      ) : null}

      {mode === 'operator' && sendState.error ? (
        <Text tone="danger">{sendState.error}</Text>
      ) : null}
      {mode === 'operator' && sendState.success ? (
        <Text tone="success">{sendState.success}</Text>
      ) : null}
      {mode === 'operator' && !driver.email ? (
        <Text tone="muted">Add email address to send a self-service link.</Text>
      ) : null}

      {isOpen ? (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>
              {mode === 'self_service' ? 'Complete identity verification' : 'Verify identity'}
            </CardTitle>
            <CardDescription>
              Complete live verification step by step, or continue with manual verification only when live liveness is unavailable.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <VerificationStepIndicator current={currentStep} />

            <form action={startFormAction} className="grid gap-4 md:grid-cols-2">
              {mode === 'self_service' ? (
                <input name="token" type="hidden" value={selfServiceToken ?? ''} />
              ) : (
                <input name="driverId" type="hidden" value={driver.id} />
              )}

              <SearchableSelect
                helperText="Country defaults to the organisation or driver country."
                inputId={`countryCode-${driver.id}`}
                label="Country"
                name="countryCode"
                onChange={setCountryCode}
                options={countryOptions}
                placeholder="Select country"
                required
                value={countryCode}
              />
              <div className="space-y-3 rounded-[var(--mobiris-radius-card)] border border-[var(--mobiris-border)] bg-white p-4 md:col-span-2">
                <Text tone="strong">Step 1: Choose how to verify</Text>
                <Text tone="muted">
                  Start the live session to open the camera on this device. If live liveness is unavailable, switch to manual verification only and submit identifiers for review.
                </Text>
                <div className="flex flex-wrap gap-3">
                  <Button
                    disabled={isStarting}
                    onClick={() => setVerificationMode('live')}
                    type="submit"
                  >
                    {isStarting && verificationMode === 'live' ? 'Starting...' : startState.errorCode === 'liveness_unavailable' ? 'Try again' : 'Start live verification'}
                  </Button>
                  <Button
                    onClick={() => {
                      setVerificationMode('manual');
                      resetSelfieCapture();
                    }}
                    type="button"
                    variant="secondary"
                  >
                    Manual verification only
                  </Button>
                </div>
              </div>
            </form>

            {startState.error ? <Text tone="danger">{startState.error}</Text> : null}

            <div className="space-y-3 rounded-[var(--mobiris-radius-card)] border border-[var(--mobiris-border)] bg-[var(--mobiris-primary-tint)] p-4">
              <Text tone="strong">Verification session</Text>
              <Text tone="muted">
                {isManualMode
                  ? 'Manual verification is active. Submit identifiers and consent without a live selfie.'
                  : 'Once the live session starts, the camera opens on this device so the selfie can be captured immediately.'}
              </Text>
              {session && !isManualMode ? (
                <div className="grid gap-2 text-sm text-slate-700 md:grid-cols-2">
                  <Text>Provider: {session.providerName}</Text>
                  <Text>{cameraReady ? 'Camera is ready' : selfiePreviewUrl ? 'Selfie captured' : 'Opening camera...'}</Text>
                  <Text>
                    Backup checks:{' '}
                    {session.fallbackChain.length > 0
                      ? session.fallbackChain.join(', ')
                      : 'None reported'}
                  </Text>
                  <Text>Expires: {session.expiresAt ? session.expiresAt : 'Not provided'}</Text>
                </div>
              ) : isManualMode ? (
                <Text tone="muted">
                  This submission will continue without a live selfie and may be routed into manual review.
                </Text>
              ) : (
                <Text tone="muted">
                  Start live verification to create the liveness session and open the camera.
                </Text>
              )}
            </div>

            <form action={resolveFormAction} className="grid gap-4 md:grid-cols-2">
              {mode === 'self_service' ? (
                <input name="token" type="hidden" value={selfServiceToken ?? ''} />
              ) : (
                <input name="driverId" type="hidden" value={driver.id} />
              )}
              <input name="verificationMode" type="hidden" value={verificationMode} />
              <input name="countryCode" type="hidden" value={countryCode} />
              <input name="providerName" type="hidden" value={session?.providerName ?? ''} />
              <input name="sessionId" type="hidden" value={session?.sessionId ?? ''} />
              {manualIdentifierOptions.map((option) => (
                <input
                  key={option.value}
                  name={`identifier_${option.value}`}
                  type="hidden"
                  value={identifierValues[option.value] ?? ''}
                />
              ))}

              <div className="space-y-3 md:col-span-2">
                <Text tone="strong">Step 2: Enter identifiers and consent</Text>
                <div className="grid gap-4 md:grid-cols-2">
                  {manualIdentifierOptions.map((option) => (
                    <div className="space-y-2" key={option.value}>
                      <Label htmlFor={`${option.value}-${driver.id}`}>{option.label}</Label>
                      <Input
                        autoComplete="off"
                        id={`${option.value}-${driver.id}`}
                        onChange={(event) => updateIdentifierValue(option.value, event.target.value)}
                        placeholder={getIdentifierPlaceholder(option.label)}
                        value={identifierValues[option.value] ?? ''}
                      />
                    </div>
                  ))}
                </div>
                <div className="grid gap-4 rounded-[var(--mobiris-radius-card)] border border-[var(--mobiris-border)] bg-white p-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <Text tone="muted">Phone on record</Text>
                    <Text>{driver.phone}</Text>
                  </div>
                  <div className="space-y-1">
                    <Text tone="muted">Email on record</Text>
                    <Text>{driver.email ?? 'No email recorded'}</Text>
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    className="size-4 accent-[var(--mobiris-primary)]"
                    name="subjectConsent"
                    type="checkbox"
                  />
                  <span>I confirm the driver has given consent for liveness and identity verification.</span>
                </label>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor={`selfieCapture-${driver.id}`}>Step 3: Live selfie</Label>
                <input name="selfieImageBase64" type="hidden" value={selfieImageBase64} />
                {!isManualMode ? (
                  <Text tone="muted">
                    File upload is disabled here. Use the live camera flow below so the verification run stays tied to the active liveness session.
                  </Text>
                ) : null}
                {!session && !isManualMode ? (
                  <Text tone="muted">
                    Start live verification first to open the camera on this device.
                  </Text>
                ) : null}
                {session && !isManualMode && !cameraReady && !selfiePreviewUrl ? (
                  <Button onClick={() => void startCamera()} type="button" variant="secondary">
                    Open camera again
                  </Button>
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
                      <Button onClick={captureSelfie} type="button">
                        Capture selfie
                      </Button>
                      <Button onClick={resetSelfieCapture} type="button" variant="ghost">
                        Cancel camera
                      </Button>
                    </div>
                  </div>
                ) : null}
                {selfiePreviewUrl && !isManualMode ? (
                  <div className="space-y-2 rounded-[var(--mobiris-radius-card)] border border-[var(--mobiris-border)] bg-white p-3">
                    <Text tone="strong">Captured live selfie</Text>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt="Captured live selfie preview"
                      className="max-h-48 rounded-[var(--mobiris-radius-card)] object-cover"
                      src={selfiePreviewUrl}
                    />
                    <Button onClick={resetSelfieCapture} type="button" variant="ghost">
                      Retake selfie
                    </Button>
                  </div>
                ) : null}
                {cameraError ? <Text tone="danger">{cameraError}</Text> : null}
              </div>

              <div className="md:col-span-2">
                <Button
                  disabled={isResolving || (!isManualMode && (!session || !selfieImageBase64))}
                  type="submit"
                >
                  {isResolving ? 'Submitting...' : isManualMode ? 'Submit manual verification' : 'Submit verification'}
                </Button>
                {!isManualMode && !selfieImageBase64 ? (
                  <Text className="mt-2" tone="muted">
                    Capture a live selfie before submitting verification.
                  </Text>
                ) : null}
              </div>
            </form>

            {resolveState.error ? <Text tone="danger">{resolveState.error}</Text> : null}

            {result ? (
              <div className="space-y-3 rounded-[var(--mobiris-radius-card)] border border-[var(--mobiris-border)] bg-[var(--mobiris-primary-tint)] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={identityTone}>{identityLabel}</Badge>
                  {resolveState.success ? <Text>{resolveState.success}</Text> : null}
                </div>
                <div className="grid gap-2 text-sm text-slate-700 md:grid-cols-2">
                  <Text>Decision: {result.decision}</Text>
                  <Text>
                    Provider status: {result.providerVerificationStatus ?? result.providerLookupStatus ?? 'Not provided'}
                  </Text>
                  <Text>
                    Liveness passed:{' '}
                    {result.livenessPassed === true
                      ? 'Yes'
                      : result.livenessPassed === false
                        ? 'No'
                        : 'Awaiting provider evidence'}
                  </Text>
                  <Text>
                    Liveness confidence: {result.livenessConfidenceScore ?? 'Not returned'}
                  </Text>
                  <Text>Provider: {result.livenessProviderName ?? result.providerName ?? 'Not returned'}</Text>
                  <Text>Confidence: {result.verificationConfidence ?? 'Not returned'}</Text>
                </div>
                {result.livenessReason || result.providerVerificationStatus || result.providerLookupStatus ? (
                  <Text tone="muted">
                    {result.livenessReason ?? result.providerVerificationStatus ?? result.providerLookupStatus}
                  </Text>
                ) : null}
                {identityStatus === 'review_needed' ? (
                  <Text>
                    This driver cannot be activated yet. Open the review guidance to see what your operations team should do next.
                  </Text>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
