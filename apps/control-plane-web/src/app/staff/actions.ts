'use server';

import { revalidatePath } from 'next/cache';
import { completeStaffInvitation, createStaffInvitation, deactivateStaffMember } from '../../lib/api-control-plane';

export interface StaffActionState {
  success?: string;
  error?: string;
  invitationUrl?: string;
  invitationExpiresAt?: string;
}

export async function createStaffInvitationAction(
  _previousState: StaffActionState,
  formData: FormData,
): Promise<StaffActionState> {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const role = String(formData.get('role') ?? '').trim();

  if (!name || !email || !role) {
    return { error: 'Name, email, and role are required.' };
  }

  try {
    const result = await createStaffInvitation({ name, email, role });
    revalidatePath('/staff');
    return {
      success: `Invitation created for ${email}.`,
      ...(result.invitationUrl ? { invitationUrl: result.invitationUrl } : {}),
      ...(result.invitationExpiresAt
        ? { invitationExpiresAt: result.invitationExpiresAt }
        : {}),
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to create staff invitation.',
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

export async function completeStaffInvitationAction(
  _previousState: StaffActionState,
  formData: FormData,
): Promise<StaffActionState> {
  const token = String(formData.get('token') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');

  if (!token || !password || !confirmPassword) {
    return { error: 'Complete the password form to activate the account.' };
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  try {
    await completeStaffInvitation({ token, password });
    return { success: 'Your staff invitation has been accepted. You can now sign in.' };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unable to complete invitation.',
    };
  }
}
