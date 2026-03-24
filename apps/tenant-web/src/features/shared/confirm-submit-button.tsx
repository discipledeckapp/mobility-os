'use client';

import { useState, type RefObject } from 'react';
import { Button, type ButtonProps } from '@mobility-os/ui';
import { Modal } from './modal';

export function ConfirmSubmitButton({
  label,
  confirmTitle,
  confirmDescription,
  confirmLabel,
  formRef,
  disabled,
  onConfirm,
  size = 'sm',
  variant = 'secondary',
}: {
  label: string;
  confirmTitle: string;
  confirmDescription: string;
  confirmLabel?: string;
  formRef: RefObject<HTMLFormElement | null>;
  disabled?: boolean;
  onConfirm?: () => void;
  size?: ButtonProps['size'];
  variant?: ButtonProps['variant'];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button disabled={disabled} onClick={() => setOpen(true)} size={size} type="button" variant={variant}>
        {label}
      </Button>
      <Modal
        description={confirmDescription}
        footer={
          <>
            <Button onClick={() => setOpen(false)} size="sm" variant="ghost">
              Cancel
            </Button>
            <Button
              onClick={() => {
                onConfirm?.();
                formRef.current?.requestSubmit();
                setOpen(false);
              }}
              size="sm"
            >
              {confirmLabel ?? label}
            </Button>
          </>
        }
        onClose={() => setOpen(false)}
        open={open}
        title={confirmTitle}
      >
        <p className="text-sm leading-6 text-slate-600">{confirmDescription}</p>
      </Modal>
    </>
  );
}
