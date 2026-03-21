import type { Route } from 'next';

export interface ControlPlaneSummaryItem {
  label: string;
  value: string;
  tone: 'success' | 'warning' | 'neutral';
  detail: string;
}

export interface ControlPlaneFeatureCard {
  href: Route;
  title: string;
  description: string;
  status: 'Operational' | 'Needs review' | 'Controlled rollout';
}

export function getControlPlaneSummary(): ControlPlaneSummaryItem[] {
  return [
    {
      label: 'Organisation onboarding',
      value: 'Ready',
      tone: 'success',
      detail:
        'Provision a new organisation, first operator, subscription, and opening wallet state.',
    },
    {
      label: 'Subscription controls',
      value: 'Active',
      tone: 'success',
      detail: 'Review plan posture, billing cadence, and governance decisions from one place.',
    },
    {
      label: 'Risk posture',
      value: 'Needs review',
      tone: 'warning',
      detail:
        'Wallet exceptions, feature rollout, and lifecycle controls still need daily operator attention.',
    },
  ];
}

export function getControlPlaneFeatureCards(): ControlPlaneFeatureCard[] {
  return [
    {
      href: '/tenants',
      title: 'Organisation governance',
      description:
        'Onboard, review, and intervene on organisation lifecycle without touching tenant data directly.',
      status: 'Operational',
    },
    {
      href: '/subscriptions',
      title: 'Subscriptions',
      description:
        'Track plan posture, billing periods, and service continuity decisions for each organisation.',
      status: 'Controlled rollout',
    },
    {
      href: '/tenant-lifecycle',
      title: 'Tenant lifecycle',
      description:
        'Review lifecycle posture and move organisations through governed status transitions.',
      status: 'Operational',
    },
    {
      href: '/billing-operations',
      title: 'Billing operations',
      description:
        'Run billing cycles and collections deliberately instead of depending on ad hoc backend calls.',
      status: 'Operational',
    },
    {
      href: '/wallets',
      title: 'Platform Wallets',
      description:
        'Monitor SaaS balances, top-up posture, and verification-fee recovery without mixing operational wallets.',
      status: 'Controlled rollout',
    },
    {
      href: '/feature-flags',
      title: 'Feature Flags',
      description:
        'Stage controlled rollout by organisation, plan, and country profile with clear governance intent.',
      status: 'Needs review',
    },
  ];
}
