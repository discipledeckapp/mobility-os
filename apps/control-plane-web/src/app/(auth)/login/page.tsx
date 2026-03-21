import { ControlPlaneAuthShell } from '../control-plane-auth-shell';
import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <ControlPlaneAuthShell
      eyebrow="Platform access"
      subtitle="Sign in with your platform admin account to manage organisations and governance controls."
      title="Sign in to the control plane"
    >
      <LoginForm />
    </ControlPlaneAuthShell>
  );
}
