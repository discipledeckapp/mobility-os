'use client';

import { useEffect, useState } from 'react';
import { type ProcessingVariant, getProcessingContent } from '../domain-config/dist/index.js';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Text } from './typography';

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

type ProcessingStepState = 'pending' | 'active' | 'complete';

function getVariantClasses(variant: ProcessingVariant) {
  switch (variant) {
    case 'verification':
      return {
        tint: 'from-blue-50 via-white to-slate-50',
        glow: 'bg-blue-500/15',
        accent: 'text-blue-700',
        ring: 'border-blue-200',
      };
    case 'payment':
      return {
        tint: 'from-emerald-50 via-white to-slate-50',
        glow: 'bg-emerald-500/15',
        accent: 'text-emerald-700',
        ring: 'border-emerald-200',
      };
    case 'upload':
      return {
        tint: 'from-amber-50 via-white to-slate-50',
        glow: 'bg-amber-500/15',
        accent: 'text-amber-700',
        ring: 'border-amber-200',
      };
    case 'reporting':
      return {
        tint: 'from-indigo-50 via-white to-slate-50',
        glow: 'bg-indigo-500/15',
        accent: 'text-indigo-700',
        ring: 'border-indigo-200',
      };
    default:
      return {
        tint: 'from-slate-50 via-white to-slate-50',
        glow: 'bg-sky-500/12',
        accent: 'text-sky-700',
        ring: 'border-slate-200',
      };
  }
}

function useRotatingTip(tips: string[], delayMs = 3600) {
  const safeTips = tips.length > 0 ? tips : ['Working on your request.'];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (safeTips.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % safeTips.length);
    }, delayMs);

    return () => window.clearInterval(interval);
  }, [delayMs, safeTips.length]);

  return safeTips[index] ?? safeTips[0];
}

function ProcessingVisual({ variant }: { variant: ProcessingVariant }) {
  const variantClasses = getVariantClasses(variant);

  return (
    <div className="relative h-16 w-16 shrink-0" aria-hidden="true">
      <div
        className={cx(
          'absolute inset-0 rounded-full blur-xl processing-pulse',
          variantClasses.glow,
        )}
      />
      <div className="absolute inset-0 rounded-full border border-slate-200/80 bg-white/80 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.4)]" />
      <div className="absolute inset-[18%] rounded-full border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#eef4ff_100%)]" />
      <div className="absolute inset-[30%] rounded-full bg-[var(--mobiris-primary)]/85 processing-pulse" />
      <div className="absolute inset-x-[18%] top-1/2 h-px -translate-y-1/2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full w-1/2 processing-scan rounded-full bg-[var(--mobiris-primary)]" />
      </div>
      <div className="absolute inset-[-8%] rounded-full border border-slate-300/70 processing-orbit" />
    </div>
  );
}

function StepList({
  steps,
  activeStep,
}: {
  steps: string[];
  activeStep?: number | undefined;
}) {
  const safeActiveStep = activeStep ?? 0;
  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        const state: ProcessingStepState =
          index < safeActiveStep
            ? 'complete'
            : index === safeActiveStep
              ? 'active'
              : 'pending';

        return (
          <div className="flex items-center gap-3" key={step}>
            <div
              className={cx(
                'flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-all duration-300',
                state === 'complete' &&
                  'border-emerald-200 bg-emerald-50 text-emerald-700',
                state === 'active' &&
                  'border-[var(--mobiris-primary)]/25 bg-[var(--mobiris-primary-tint)] text-[var(--mobiris-primary-dark)] processing-pulse',
                state === 'pending' && 'border-slate-200 bg-white text-slate-400',
              )}
            >
              {state === 'complete' ? '✓' : index + 1}
            </div>
            <div className="min-w-0">
              <p
                className={cx(
                  'text-sm font-medium transition-colors duration-300',
                  state === 'pending' ? 'text-slate-500' : 'text-slate-900',
                )}
              >
                {step}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export interface ProcessingStateCardProps {
  variant: ProcessingVariant;
  title?: string | undefined;
  message?: string | undefined;
  steps?: string[] | undefined;
  activeStep?: number | undefined;
  tips?: string[] | undefined;
  progressLabel?: string | undefined;
  compact?: boolean | undefined;
}

export function ProcessingStateCard({
  variant,
  title,
  message,
  steps,
  activeStep,
  tips,
  progressLabel,
  compact = false,
}: ProcessingStateCardProps) {
  const content = getProcessingContent(variant);
  const safeTitle = title ?? content.title;
  const safeMessage = message ?? content.message;
  const safeSteps = steps ?? content.steps;
  const safeTips = tips ?? content.tips;
  const variantClasses = getVariantClasses(variant);
  const activeTip = useRotatingTip(safeTips);

  return (
    <Card
      className={cx(
        'overflow-hidden border shadow-[0_30px_80px_-42px_rgba(15,23,42,0.45)]',
        variantClasses.ring,
      )}
    >
      <CardContent
        className={cx(
          'relative bg-gradient-to-br p-6',
          variantClasses.tint,
          compact ? 'space-y-4' : 'space-y-6 md:p-7',
        )}
      >
        <div className="absolute right-0 top-0 h-28 w-28 -translate-y-8 translate-x-8 rounded-full bg-[var(--mobiris-primary)]/8 blur-2xl" />
        <div className="relative flex items-start gap-4">
          <ProcessingVisual variant={variant} />
          <div className="min-w-0 space-y-2">
            <Text className={cx('text-xs font-semibold uppercase tracking-[0.18em]', variantClasses.accent)}>
              Guided processing
            </Text>
            <CardTitle className="text-xl">{safeTitle}</CardTitle>
            <Text tone="muted">{safeMessage}</Text>
            {progressLabel ? (
              <div className="inline-flex rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600">
                {progressLabel}
              </div>
            ) : null}
          </div>
        </div>

        <div className={cx('grid gap-5', compact ? '' : 'md:grid-cols-[1.1fr_0.9fr]')}>
          <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-white/80 bg-white/80 p-4 backdrop-blur-sm">
            <StepList activeStep={activeStep} steps={safeSteps} />
          </div>
          <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-200/80 bg-slate-950/[0.03] p-4">
            <Text className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              While you wait
            </Text>
            <p className="mt-3 text-sm leading-6 text-slate-700 processing-fade">
              {activeTip}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function FullScreenProcessingOverlay({
  variant,
  title,
  message,
  steps,
  activeStep,
  tips,
  isVisible,
  blocking = true,
}: ProcessingStateCardProps & { isVisible: boolean; blocking?: boolean | undefined }) {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className={cx(
        'fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-[2px]',
        !blocking && 'pointer-events-none',
      )}
      role="status"
    >
      <div className="w-full max-w-2xl">
        <ProcessingStateCard
          activeStep={activeStep}
          message={message}
          steps={steps}
          tips={tips}
          title={title}
          variant={variant}
        />
      </div>
    </div>
  );
}

export function InlineLoadingState({
  variant,
  title,
  message,
  compact = true,
}: Pick<ProcessingStateCardProps, 'variant' | 'title' | 'message' | 'compact'>) {
  return (
    <ProcessingStateCard
      compact={compact}
      message={message}
      steps={[]}
      tips={[]}
      title={title}
      variant={variant}
    />
  );
}

export function SkeletonLoadingBlocks({
  rows = 3,
  columns = 1,
  title = 'Preparing content',
  description = 'Loading the latest view and shaping the next screen.',
}: {
  rows?: number;
  columns?: number;
  title?: string;
  description?: string;
}) {
  const gridClass =
    columns >= 3 ? 'md:grid-cols-3' : columns === 2 ? 'md:grid-cols-2' : '';

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <Text tone="muted">{description}</Text>
      </CardHeader>
      <CardContent className={cx('grid gap-4', gridClass)}>
        {Array.from({ length: rows }).map((_, index) => (
          <div
            className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4"
            key={`skeleton-${index + 1}`}
          >
            <div className="processing-shimmer h-4 w-1/3 rounded-full bg-slate-200/70" />
            <div className="mt-4 processing-shimmer h-10 w-4/5 rounded-2xl bg-slate-200/70" />
            <div className="mt-3 processing-shimmer h-4 w-3/5 rounded-full bg-slate-200/70" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function ActionPendingButtonState({
  label,
  pendingLabel,
  pending,
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
}: {
  label: string;
  pendingLabel: string;
  pending: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string | undefined;
  type?: 'button' | 'submit' | 'reset';
}) {
  return (
    <Button
      aria-busy={pending}
      className={className}
      disabled={pending}
      size={size}
      type={type}
      variant={variant}
    >
      <span className="flex items-center gap-2">
        {pending ? (
          <span className="relative flex h-4 w-4 items-center justify-center" aria-hidden="true">
            <span className="absolute h-4 w-4 rounded-full border border-current/20" />
            <span className="absolute h-2.5 w-2.5 rounded-full bg-current/70 processing-pulse" />
          </span>
        ) : null}
        <span>{pending ? pendingLabel : label}</span>
      </span>
    </Button>
  );
}
