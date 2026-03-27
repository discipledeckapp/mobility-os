export type StatusTone = 'neutral' | 'success' | 'warning' | 'danger';

export function identityTone(status: string): StatusTone {
  if (status === 'verified') {
    return 'success';
  }
  if (status === 'failed') {
    return 'danger';
  }
  if (status === 'review_needed' || status === 'pending_verification') {
    return 'warning';
  }
  return 'neutral';
}

export function readinessTone(status: string): StatusTone {
  if (status === 'ready') {
    return 'success';
  }
  if (status === 'partially_ready') {
    return 'warning';
  }
  return 'danger';
}

export function assignmentStatusTone(status: string): StatusTone {
  if (status === 'ended' || status === 'active') {
    return 'success';
  }
  if (status === 'pending_driver_confirmation' || status === 'created' || status === 'pending') {
    return 'warning';
  }
  if (status === 'cancelled' || status === 'declined' || status === 'disputed' || status === 'waived') {
    return 'danger';
  }
  return 'neutral';
}

export function remittanceTone(status: string): StatusTone {
  if (status === 'completed' || status === 'partially_settled') {
    return 'success';
  }
  if (status === 'pending') {
    return 'warning';
  }
  if (status === 'disputed' || status === 'waived' || status === 'cancelled_due_to_assignment_end') {
    return 'danger';
  }
  return 'neutral';
}

export function riskTone(riskBand: string): StatusTone {
  const normalized = riskBand.toLowerCase();
  if (normalized === 'low') {
    return 'success';
  }
  if (normalized === 'medium') {
    return 'warning';
  }
  if (normalized === 'high' || normalized === 'critical') {
    return 'danger';
  }
  return 'neutral';
}
