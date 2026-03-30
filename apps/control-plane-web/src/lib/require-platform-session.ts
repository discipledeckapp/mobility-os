import { redirect } from 'next/navigation';
import { getPlatformApiToken } from './api-control-plane';

export async function requirePlatformSession(): Promise<string> {
  try {
    return await getPlatformApiToken();
  } catch {
    redirect('/login');
  }
}
