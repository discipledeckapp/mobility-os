'use client';

import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Text } from '@mobility-os/ui';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  confirmDriverAdminOverride,
  requestDriverAdminOverride,
  setDriverAdminOverride,
} from '../../lib/api-core';

interface Props {
  driverId: string;
  adminAssignmentOverride: boolean;
  allowAdminAssignmentOverride: boolean;
  /** True when fraud flags are active — override cannot be set regardless of settings */
  hasFraudFlag: boolean;
}

export function DriverAdminOverridePanel({
  driverId,
  adminAssignmentOverride,
  allowAdminAssignmentOverride,
  hasFraudFlag,
}: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpDestination, setOtpDestination] = useState<string | null>(null);
  const [otpExpiresAt, setOtpExpiresAt] = useState<string | null>(null);
  const [evidenceImageDataUrl, setEvidenceImageDataUrl] = useState<string | null>(null);

  if (!allowAdminAssignmentOverride) {
    return null;
  }

  const canEnable = !hasFraudFlag;
  const hasPendingOtp = Boolean(otpDestination);
  const expiryLabel = useMemo(() => {
    if (!otpExpiresAt) {
      return null;
    }
    const parsed = new Date(otpExpiresAt);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toLocaleTimeString();
  }, [otpExpiresAt]);

  async function handleEvidenceFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setEvidenceImageDataUrl(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setEvidenceImageDataUrl(typeof reader.result === 'string' ? reader.result : null);
    };
    reader.readAsDataURL(file);
  }

  const handleRequestOtp = async () => {
    if (!reason.trim()) {
      setError('Enter a reason before requesting an override OTP.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await requestDriverAdminOverride(driverId, {
        reason: reason.trim(),
        ...(evidenceImageDataUrl ? { evidenceImageDataUrl } : {}),
      });
      setOtpDestination(response.destination);
      setOtpExpiresAt(response.expiresAt);
      setSuccess('OTP sent. Enter the code to finish the override.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to request override OTP.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirm = async () => {
    if (!otpCode.trim()) {
      setError('Enter the OTP code that was sent to your email.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await confirmDriverAdminOverride(driverId, otpCode.trim());
      setOtpCode('');
      setOtpDestination(null);
      setOtpExpiresAt(null);
      setReason('');
      setEvidenceImageDataUrl(null);
      setSuccess('Override confirmed and logged.');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to confirm override.');
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await setDriverAdminOverride(driverId, false);
      setOtpCode('');
      setOtpDestination(null);
      setOtpExpiresAt(null);
      setReason('');
      setEvidenceImageDataUrl(null);
      setSuccess('Override cleared.');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to clear assignment override.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className={adminAssignmentOverride ? 'border-blue-200 bg-blue-50/50' : 'border-slate-200 bg-white'}>
      <CardHeader>
        <CardTitle>Admin assignment override</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone={adminAssignmentOverride ? 'success' : hasPendingOtp ? 'warning' : 'neutral'}>
            {adminAssignmentOverride
              ? 'Override active'
              : hasPendingOtp
                ? 'OTP confirmation pending'
                : 'Not overridden'}
          </Badge>
          {hasFraudFlag ? <Badge tone="danger">Blocked by watchlist or fraud risk</Badge> : null}
        </div>

        <Text tone="muted">
          {adminAssignmentOverride
            ? 'This driver can be assigned despite incomplete readiness checks, but the driver must still accept the assignment before remittance can start.'
            : 'Use override only when operations must continue and you can justify the risk. The request is logged with your reason, optional evidence, and OTP confirmation.'}
        </Text>

        {!adminAssignmentOverride ? (
          <div className="space-y-4 rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-200 bg-slate-50/60 p-4">
            <div className="space-y-2">
              <Label htmlFor="overrideReason">Reason</Label>
              <textarea
                className="min-h-24 w-full rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 py-2 text-sm text-[var(--mobiris-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--mobiris-primary)]"
                id="overrideReason"
                onChange={(event) => setReason(event.target.value)}
                placeholder="Explain why this driver should be allowed onto assignment despite incomplete readiness."
                value={reason}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="overrideEvidence">Optional evidence image</Label>
              <input
                accept="image/png,image/jpeg,image/webp"
                className="block w-full cursor-pointer rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 py-2 text-sm text-[var(--mobiris-ink)]"
                id="overrideEvidence"
                onChange={handleEvidenceFileChange}
                type="file"
              />
              <Text tone="muted">Upload a supporting image only when it helps justify the override.</Text>
            </div>

            {hasPendingOtp ? (
              <div className="space-y-2 rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-amber-200 bg-amber-50/70 p-3">
                <Text className="font-semibold text-[var(--mobiris-ink)]">
                  OTP sent to {otpDestination}
                </Text>
                {expiryLabel ? <Text tone="muted">Code expires at {expiryLabel}.</Text> : null}
                <div className="space-y-2">
                  <Label htmlFor="overrideOtpCode">OTP code</Label>
                  <Input
                    id="overrideOtpCode"
                    onChange={(event) => setOtpCode(event.target.value)}
                    placeholder="Enter 6-digit code"
                    value={otpCode}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button disabled={saving} onClick={handleConfirm} size="sm">
                    {saving ? 'Confirming…' : 'Confirm override'}
                  </Button>
                  <Button disabled={saving} onClick={handleRequestOtp} size="sm" variant="ghost">
                    Resend OTP
                  </Button>
                </div>
              </div>
            ) : (
              <Button disabled={saving || !canEnable} onClick={handleRequestOtp} size="sm">
                {saving ? 'Sending OTP…' : 'Request override OTP'}
              </Button>
            )}
          </div>
        ) : (
          <Button disabled={saving} onClick={handleClear} size="sm" variant="ghost">
            {saving ? 'Clearing…' : 'Clear override'}
          </Button>
        )}

        {error ? <Text tone="danger">{error}</Text> : null}
        {success ? <Text tone="success">{success}</Text> : null}
      </CardContent>
    </Card>
  );
}
