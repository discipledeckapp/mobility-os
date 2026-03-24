'use client';

import { Button } from '@mobility-os/ui';
import { logoutAction } from '../../app/(auth)/login/actions';
import { Modal } from './modal';
import { useState } from 'react';

export function LogoutButton({
  className,
  mobile = false,
}: {
  className?: string;
  mobile?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className={className}
        onClick={() => setOpen(true)}
        type="button"
      >
        {mobile ? 'Log out' : (
          <>
            <svg
              aria-hidden="true"
              fill="none"
              focusable="false"
              height="15"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.6"
              viewBox="0 0 16 16"
              width="15"
            >
              <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3" />
              <path d="M10.5 11L14 8l-3.5-3" />
              <path d="M14 8H6" />
            </svg>
            Log out
          </>
        )}
      </button>

      <Modal
        description="You will need to sign in again to continue managing your organisation."
        footer={
          <>
            <Button onClick={() => setOpen(false)} size="sm" variant="ghost">
              Stay signed in
            </Button>
            <form action={logoutAction}>
              <Button size="sm" type="submit">
                Log out
              </Button>
            </form>
          </>
        }
        onClose={() => setOpen(false)}
        open={open}
        title="Log out of Mobiris?"
      >
        <p className="text-sm leading-6 text-slate-600">
          This will end your current session on this device.
        </p>
      </Modal>
    </>
  );
}
