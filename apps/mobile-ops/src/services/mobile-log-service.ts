import { type MobileLogInput, postMobileLog } from '../api';
import { mobileEnv } from '../config/env';

type MobileLogContext = {
  userId?: string | null;
  tenantId?: string | null;
  route?: string | null;
};

let getMobileLogContext: (() => MobileLogContext | null) | null = null;

export function configureMobileLogContext(getter: (() => MobileLogContext | null) | null) {
  getMobileLogContext = getter;
}

export async function reportMobileLog(input: MobileLogInput) {
  if (!mobileEnv.enableCrashReporting) {
    return;
  }

  const context = getMobileLogContext?.() ?? null;
  await postMobileLog({
    ...input,
    userId: input.userId ?? context?.userId ?? undefined,
    tenantId: input.tenantId ?? context?.tenantId ?? undefined,
    route: input.route ?? context?.route ?? undefined,
  });
}
