import { AuthSplitShell } from '../auth-split-shell';
import { ResetPasswordForm } from './reset-password-form';

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token = '' } = await searchParams;

  return (
    <AuthSplitShell
      eyebrow="Account Security"
      subtitle="Choose a new password for your Mobiris account."
      title="Reset your password"
    >
      {!token ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-4">
          <p className="text-sm font-semibold text-amber-800">Invalid reset link</p>
          <p className="mt-1 text-sm text-amber-700">
            This link is missing a reset token. Use the link from the password reset email, or
            request a new one.
          </p>
        </div>
      ) : (
        <ResetPasswordForm token={token} />
      )}
    </AuthSplitShell>
  );
}
