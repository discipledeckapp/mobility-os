import {
  type ComponentPropsWithoutRef,
  type HTMLAttributes,
  type TableHTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
  forwardRef,
} from 'react';

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export const Table = forwardRef<HTMLTableElement, TableHTMLAttributes<HTMLTableElement>>(
  function Table({ className, ...props }, ref) {
    return (
      <div className="overflow-hidden rounded-[var(--mobiris-radius-card)] border border-[var(--mobiris-border)] bg-white/95 shadow-[0_22px_50px_-28px_rgba(15,23,42,0.28)]">
        <div className="max-h-[34rem] overflow-auto">
          <table
            className={cx('min-w-full border-collapse text-left', className)}
            ref={ref}
            {...props}
          />
        </div>
      </div>
    );
  },
);

export function TableViewport({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  return <div className={cx('max-h-[34rem] overflow-auto', className)} {...props} />;
}

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(function TableHeader({ className, ...props }, ref) {
  return (
    <thead
      className={cx(
        'sticky top-0 z-10 border-b border-[var(--mobiris-border)] bg-[var(--mobiris-primary-tint)] backdrop-blur-sm',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});

export const TableBody = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(function TableBody({ className, ...props }, ref) {
  return (
    <tbody
      className={cx('divide-y divide-[var(--mobiris-border)]', className)}
      ref={ref}
      {...props}
    />
  );
});

export const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  function TableRow({ className, ...props }, ref) {
    return (
      <tr
        className={cx('transition-colors hover:bg-[var(--mobiris-primary-tint)]', className)}
        ref={ref}
        {...props}
      />
    );
  },
);

export const TableHead = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
  function TableHead({ className, ...props }, ref) {
    return (
      <th
        className={cx(
          'h-11 px-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mobiris-ink-soft)]',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);

export const TableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
  function TableCell({ className, ...props }, ref) {
    return (
      <td
        className={cx('px-4 py-3 text-sm text-[var(--mobiris-ink-soft)]', className)}
        ref={ref}
        {...props}
      />
    );
  },
);
