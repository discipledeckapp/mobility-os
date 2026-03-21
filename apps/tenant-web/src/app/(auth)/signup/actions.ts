'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { loginTenantUser, registerOrganisation, verifyOrgSignupOtp } from '../../../lib/api-core';
import { TENANT_AUTH_COOKIE_NAME, TENANT_REFRESH_COOKIE_NAME } from '../../../lib/auth';

export interface SignupState {
  error?: string;
  userId?: string;
  tenantId?: string;
  tenantSlug?: string;
}

export interface VerifyOtpState {
  error?: string;
  verified?: boolean;
}

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === 'string' ? v.trim() : '';
}

export async function registerOrganisationAction(
  _prevState: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const orgName = str(formData, 'orgName');
  const slug = str(formData, 'slug');
  const country = str(formData, 'country');
  const businessModel = str(formData, 'businessModel');
  const adminName = str(formData, 'adminName');
  const adminEmail = str(formData, 'adminEmail');
  const adminPhone = str(formData, 'adminPhone') || undefined;
  const adminPassword = str(formData, 'adminPassword');
  const confirmPassword = str(formData, 'confirmPassword');

  if (adminPassword !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }
  if (adminPassword.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }

  try {
    const result = await registerOrganisation({
      orgName,
      slug,
      country,
      businessModel,
      adminName,
      adminEmail,
      ...(adminPhone ? { adminPhone } : {}),
      adminPassword,
    });
    return {
      userId: result.userId,
      tenantId: result.tenantId,
      tenantSlug: result.tenantSlug,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Registration failed. Please try again.',
    };
  }
}

export async function verifyOtpAction(
  email: string,
  password: string,
  code: string,
): Promise<VerifyOtpState> {
  try {
    const result = await verifyOrgSignupOtp(email, code);
    if (!result.verified) {
      return { error: 'Invalid or expired verification code.' };
    }

    // Auto-login after verification
    const { accessToken, refreshToken } = await loginTenantUser({
      identifier: email,
      password,
    });
    const cookieStore = await cookies();
    cookieStore.set(TENANT_AUTH_COOKIE_NAME, accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
    cookieStore.set(TENANT_REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Verification failed. Please try again.',
    };
  }

  redirect('/');
}
