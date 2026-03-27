'use server';

import { revalidatePath } from 'next/cache';
import { resolveReviewCase, updateReviewCaseStatus } from '../../../lib/api-intelligence';

export interface ReviewCaseActionState {
  success?: string;
  error?: string;
}

export async function updateReviewCaseStatusAction(
  _previousState: ReviewCaseActionState,
  formData: FormData,
): Promise<ReviewCaseActionState> {
  const id = String(formData.get('id') ?? '').trim();
  const status = String(formData.get('status') ?? '').trim();
  const notes = String(formData.get('notes') ?? '').trim();

  if (!id || !status) {
    return { error: 'Review case and status are required.' };
  }

  try {
    await updateReviewCaseStatus(id, {
      status,
      ...(notes ? { notes } : {}),
    });
    revalidatePath('/intelligence/review-cases');
    revalidatePath(`/intelligence/persons`);
    return { success: 'Review case updated.' };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to update review case.',
    };
  }
}

export async function resolveReviewCaseAction(
  _previousState: ReviewCaseActionState,
  formData: FormData,
): Promise<ReviewCaseActionState> {
  const id = String(formData.get('id') ?? '').trim();
  const resolution = String(formData.get('resolution') ?? '').trim();
  const notes = String(formData.get('notes') ?? '').trim();

  if (!id || !resolution) {
    return { error: 'Review case and resolution are required.' };
  }

  try {
    await resolveReviewCase(id, {
      resolution,
      ...(notes ? { notes } : {}),
    });
    revalidatePath('/intelligence/review-cases');
    return { success: 'Review case resolved.' };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to resolve review case.',
    };
  }
}
