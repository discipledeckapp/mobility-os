'use client';

import { useState } from 'react';
import { ConfirmationModal } from './confirmation-modal';

type SelfServiceSignOutButtonProps = {
  href: string;
  title?: string;
  description?: string;
  className?: string;
};

export function SelfServiceSignOutButton({
  href,
  title = 'Sign out?',
  description = 'You will need to sign in again to continue this self-service session.',
  className = 'inline-flex h-10 items-center justify-center rounded-full border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50',
}: SelfServiceSignOutButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <button className={className} onClick={() => setConfirmOpen(true)} type="button">
        Sign out
      </button>

      <ConfirmationModal
        cancelLabel="Cancel"
        confirmHref={href}
        confirmLabel="Sign out"
        confirmTone="danger"
        description={description}
        onCancel={() => setConfirmOpen(false)}
        open={confirmOpen}
        title={title}
      />
    </>
  );
}
