'use client';

import { useState, type RefObject } from 'react';
import { Button, type ButtonProps } from '@mobility-os/ui';
import { Modal } from './modal';

export function ConfirmSubmitButton({
  label,
  confirmTitle,
  confirmDescription,
  confirmLabel,
  dismissLabel = 'Cancel',
  formRef,
  disabled,
  onConfirm,
  size = 'sm',
  variant = 'secondary',
  confirmVariant = 'primary',
  confirmClassName,
  children,
}: {
  label: string;
  confirmTitle: string;
  confirmDescription: string;
  confirmLabel?: string;
  dismissLabel?: string;
  formRef: RefObject<HTMLFormElement | null>;
  disabled?: boolean;
  onConfirm?: () => void;
  size?: ButtonProps['size'];
  variant?: ButtonProps['variant'];
  confirmVariant?: ButtonProps['variant'];
  confirmClassName?: string;
  children?: React.ReactNode;
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
            <Button onClick={() => setOpen(false)} size="sm" variant="secondary">
              {dismissLabel}
            </Button>
            <Button
              className={confirmClassName}
              onClick={() => {
                onConfirm?.();
                formRef.current?.requestSubmit();
                setOpen(false);
              }}
              size="sm"
              variant={confirmVariant}
            >
              {confirmLabel ?? label}
            </Button>
          </>
        }
        onClose={() => setOpen(false)}
        open={open}
        title={confirmTitle}
      >
        {children ?? <p className="text-sm leading-6 text-slate-600">{confirmDescription}</p>}
      </Modal>
    </>
  );
}
