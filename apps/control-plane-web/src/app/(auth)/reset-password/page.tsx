import { Suspense } from 'react';
import { ControlPlaneAuthShell } from '../control-plane-auth-shell';
import { ResetPasswordForm } from './reset-password-form';

export default function ResetPasswordPage() {
  return (
    <ControlPlaneAuthShell
      eyebrow="Platform recovery"
      subtitle="Finish resetting your platform staff password and return to the control plane."
      title="Reset password"
    >
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </ControlPlaneAuthShell>
  );
}
