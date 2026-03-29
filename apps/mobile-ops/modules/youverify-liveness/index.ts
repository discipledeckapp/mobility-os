import { requireOptionalNativeModule } from 'expo-modules-core';

import type { YouVerifyLivenessInput, YouVerifyLivenessResult } from './src/YouVerifyLiveness.types';

export type { YouVerifyLivenessInput, YouVerifyLivenessResult };

/**
 * Native module backed by Azure AI Vision Face Liveness Detection SDK.
 *
 * iOS:     AzureAIVisionFaceUI (CocoaPods)
 * Android: com.azure.android:azure-ai-vision-face-ui (Maven)
 *
 * Both platforms:
 *  - Receive sessionId + sessionToken (Azure Face JWT) from the YouVerify backend
 *  - Run the passive liveness challenge on-device using the camera
 *  - Return a typed result that is submitted to api-intelligence for evaluation
 *
 * The sessionToken is an Azure Cognitive Services JWT issued by YouVerify's
 * liveness/token endpoint. It authorises exactly one face liveness session against
 * the Azure Face resource configured in YouVerify's sandbox/production account.
 */
type YouVerifyLivenessNativeModule = {
  startLiveness(input: YouVerifyLivenessInput): Promise<YouVerifyLivenessResult>;
};

const YouVerifyLivenessNative =
  requireOptionalNativeModule<YouVerifyLivenessNativeModule>('YouVerifyLiveness');

export function isYouVerifyLivenessAvailable(): boolean {
  return Boolean(YouVerifyLivenessNative);
}

/**
 * Launch the native face liveness challenge.
 *
 * Resolves when the user completes or fails the challenge.
 * Rejects only on unrecoverable errors (permission denied, SDK init failure).
 * Soft failures (liveness failed, session expired) resolve with passed: false.
 */
export async function startYouVerifyLiveness(
  input: YouVerifyLivenessInput,
): Promise<YouVerifyLivenessResult> {
  if (!YouVerifyLivenessNative) {
    throw new Error(
      'Native face verification is not available on this device build. Continue in your browser to finish the live verification step.',
    );
  }
  return YouVerifyLivenessNative.startLiveness(input);
}
