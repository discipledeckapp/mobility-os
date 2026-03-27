import { ControlPlaneAuthShell } from '../control-plane-auth-shell';
import { ForgotPasswordForm } from './forgot-password-form';

export default function ForgotPasswordPage() {
  return (
    <ControlPlaneAuthShell
      eyebrow="Platform recovery"
      subtitle="Reset your platform staff password without needing another admin to bootstrap access."
      title="Forgot your password?"
    >
      <ForgotPasswordForm />
    </ControlPlaneAuthShell>
  );
}
