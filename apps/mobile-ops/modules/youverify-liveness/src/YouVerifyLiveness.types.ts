/**
 * Input to the native YouVerify liveness module.
 *
 * sessionId    — YouVerify session ID from POST /v2/api/identity/sdk/session/generate
 * sessionToken — Azure Face Liveness JWT from POST /v2/api/identity/sdk/liveness/token
 * sandbox      — true = YouVerify staging / Azure sandbox, false = production
 */
export interface YouVerifyLivenessInput {
  sessionId: string;
  sessionToken: string;
  sandbox: boolean;
}

/**
 * Result returned by the native module after liveness completes.
 *
 * passed        — true if the user passed the liveness challenge
 * faceImageB64  — base64-encoded face frame captured during liveness
 * sessionId     — echoed back so the caller can identify which session completed
 * errorCode     — set only on failure; surface to user or log for debugging
 * errorMessage  — human-readable failure reason
 */
export interface YouVerifyLivenessResult {
  passed: boolean;
  faceImageB64?: string;
  sessionId: string;
  errorCode?: string;
  errorMessage?: string;
}
