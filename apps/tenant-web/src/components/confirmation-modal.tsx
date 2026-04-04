'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@mobility-os/ui';

type ConfirmationModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  confirmHref?: string;
  confirmTone?: 'danger' | 'primary';
  onCancel: () => void;
  onConfirm?: () => void;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function ConfirmationModal({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  confirmHref,
  confirmTone = 'danger',
  onCancel,
  onConfirm,
}: ConfirmationModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCancel();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onCancel]);

  if (!open || !mounted) {
    return null;
  }

  return createPortal(
    <>
      <div
        aria-hidden="true"
        className="fixed inset-0 z-[220] bg-slate-950/55 backdrop-blur-sm animate-[modal-fade-in_180ms_ease-out]"
        onClick={onCancel}
      />
      <div className="fixed inset-0 z-[221] flex items-end justify-center p-3 sm:items-center sm:p-6">
        <div
          aria-modal="true"
          className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-white shadow-[0_36px_90px_-30px_rgba(15,23,42,0.45)] animate-[modal-sheet-in_220ms_ease-out] sm:animate-[modal-scale-in_180ms_ease-out]"
          role="dialog"
        >
          <div className="space-y-2 px-6 pt-6">
            <h2 className="text-lg font-semibold text-[var(--mobiris-ink)]">{title}</h2>
            <p className="text-sm leading-6 text-slate-600">{description}</p>
          </div>
          <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:justify-end">
            <Button onClick={onCancel} type="button" variant="secondary">
              {cancelLabel}
            </Button>
            {confirmHref ? (
              <a
                className={cx(
                  'inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-white transition',
                  confirmTone === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-[var(--mobiris-primary)] hover:bg-[var(--mobiris-primary-dark)]',
                )}
                href={confirmHref}
              >
                {confirmLabel}
              </a>
            ) : (
              <Button
                onClick={onConfirm}
                type="button"
                variant={confirmTone === 'danger' ? 'primary' : 'primary'}
              >
                {confirmLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes modal-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modal-sheet-in {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes modal-scale-in {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>,
    document.body,
  );
}
