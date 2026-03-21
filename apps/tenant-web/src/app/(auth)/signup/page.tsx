import { AuthSplitShell } from '../auth-split-shell';
import { SignupForm } from './signup-form';

export default function SignupPage() {
  return (
    <AuthSplitShell
      eyebrow="Organisation Registration"
      subtitle="Set up your fleet account in under two minutes."
      title="Register your organisation"
    >
      <SignupForm />
    </AuthSplitShell>
  );
}
