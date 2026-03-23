'use server';

import { revalidatePath } from 'next/cache';
import { createStaffMember, deactivateStaffMember } from '../../lib/api-control-plane';

export interface StaffActionState {
  success?: string;
  error?: string;
}

export async function createStaffMemberAction(
  _previousState: StaffActionState,
  formData: FormData,
): Promise<StaffActionState> {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const role = String(formData.get('role') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!name || !email || !role || !password) {
    return { error: 'All fields are required.' };
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }

  try {
    await createStaffMember({ name, email, role, password });
    revalidatePath('/staff');
    return { success: `Staff member ${email} created.` };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to create staff member.',
    };
  }
}

export async function deactivateStaffMemberAction(
  _previousState: StaffActionState,
  formData: FormData,
): Promise<StaffActionState> {
  const userId = String(formData.get('userId') ?? '').trim();

  if (!userId) {
    return { error: 'User ID is required.' };
  }

  try {
    await deactivateStaffMember(userId);
    revalidatePath('/staff');
    return { success: 'Staff member deactivated.' };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to deactivate staff member.',
    };
  }
}
