import { AuthSplitShell } from '../auth-split-shell';
import { ForgotPasswordForm } from './forgot-password-form';

export default function ForgotPasswordPage() {
  return (
    <AuthSplitShell
      eyebrow="Account Security"
      subtitle="Enter your email and we'll send you a link to reset your password."
      title="Forgot your password?"
    >
      <ForgotPasswordForm />
    </AuthSplitShell>
  );
}
