package expo.modules.youverifyliveness

import android.app.Activity
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// Azure AI Vision Face UI SDK
// Gradle: implementation 'com.azure.android:azure-ai-vision-face-ui:0.19.0-beta.1'
// Repository: https://github.com/Azure-Samples/azure-ai-vision-sdk/tree/main/samples/kotlin/face/FaceAnalyzerSample
import com.azure.android.ai.vision.face.ui.FaceAnalyzer
import com.azure.android.ai.vision.face.ui.FaceAnalyzerCreateOptions
import com.azure.android.ai.vision.face.ui.LivenessFailureReason
import com.azure.android.ai.vision.face.ui.LivenessOperationMode

// ─────────────────────────────────────────────────────────────────────────────
// YouVerifyLivenessModule
//
// Android native module that wraps the Azure AI Vision Face Liveness Detection
// SDK to provide real provider-backed face liveness for the mobile app.
//
// The sessionToken is an Azure Face API JWT issued by YouVerify's backend
// (POST /v2/api/identity/sdk/liveness/token). It authorises one liveness
// session against the Azure Face resource in YouVerify's account.
//
// Requires:
//   - CAMERA permission in AndroidManifest.xml
//   - minSdkVersion 24 (Android 7.0)
// ─────────────────────────────────────────────────────────────────────────────

private const val LIVENESS_REQUEST_CODE = 0x4C56   // "LV" in ASCII hex

class YouVerifyLivenessModule : Module() {

  private var pendingPromise: Promise? = null
  private var pendingSessionId: String? = null

  override fun definition() = ModuleDefinition {
    Name("YouVerifyLiveness")

    AsyncFunction("startLiveness") { options: Map<String, Any>, promise: Promise ->
      if (pendingPromise != null) {
        promise.reject("LIVENESS_ALREADY_RUNNING", "A liveness session is already in progress", null)
        return@AsyncFunction
      }

      val sessionId = options["sessionId"] as? String
      val sessionToken = options["sessionToken"] as? String

      if (sessionId.isNullOrBlank() || sessionToken.isNullOrBlank()) {
        promise.reject("INVALID_INPUT", "sessionId and sessionToken are required", null)
        return@AsyncFunction
      }

      val activity = appContext.activityProvider?.currentActivity
      if (activity == null) {
        promise.reject("NO_ACTIVITY", "No foreground activity available", null)
        return@AsyncFunction
      }

      pendingPromise = promise
      pendingSessionId = sessionId

      try {
        launchLiveness(activity, sessionId, sessionToken)
      } catch (error: Throwable) {
        pendingPromise = null
        pendingSessionId = null
        promise.reject("SESSION_START_FAILED", error.message ?: "Unable to start face verification", error)
      }
    }

    // Wire up Activity result so the module can capture the liveness outcome.
    OnActivityResult { _, payload ->
      if (payload.requestCode != LIVENESS_REQUEST_CODE) return@OnActivityResult

      val promise = pendingPromise ?: return@OnActivityResult
      val sessionId = pendingSessionId ?: ""
      pendingPromise = null
      pendingSessionId = null

      when (payload.resultCode) {
        Activity.RESULT_OK -> {
          val data = payload.data
          val passed = data?.getBooleanExtra(FaceAnalyzer.EXTRA_RESULT_LIVENESS_PASSED, false) ?: false
          val faceImageB64 = data?.getStringExtra(FaceAnalyzer.EXTRA_RESULT_FACE_IMAGE_BASE64)

          promise.resolve(
            mapOf(
              "passed" to passed,
              "faceImageB64" to faceImageB64,
              "sessionId" to sessionId,
            )
          )
        }

        Activity.RESULT_CANCELED -> {
          promise.resolve(
            mapOf(
              "passed" to false,
              "sessionId" to sessionId,
              "errorCode" to "USER_CANCELLED",
              "errorMessage" to "User cancelled the liveness check",
            )
          )
        }

        else -> {
          val data = payload.data
          val code = data?.getStringExtra(FaceAnalyzer.EXTRA_RESULT_FAILURE_REASON)
            ?: "LIVENESS_FAILED"
          val message = failureCodeToMessage(code)

          promise.resolve(
            mapOf(
              "passed" to false,
              "sessionId" to sessionId,
              "errorCode" to code,
              "errorMessage" to message,
            )
          )
        }
      }
    }
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  private fun launchLiveness(activity: Activity, sessionId: String, sessionToken: String) {
    // FaceAnalyzer.createForPassiveLiveness launches a fullscreen Activity that
    // runs the Azure Face Liveness passive challenge using the device camera.
    // The auth token (Azure Face JWT from YouVerify) is passed directly.
    val createOptions = FaceAnalyzerCreateOptions().apply {
      livenessOperationMode = LivenessOperationMode.PASSIVE
    }

    FaceAnalyzer.createForPassiveLiveness(
      activity,
      sessionToken,          // Azure Face JWT — authorises one session
      createOptions,
      LIVENESS_REQUEST_CODE,
    )
  }

  private fun failureCodeToMessage(code: String): String = when (code) {
    LivenessFailureReason.FACE_NOT_DETECTED.name -> "No face detected. Ensure your face is in the frame."
    LivenessFailureReason.FACE_MOVED -> "Face moved during capture. Please hold still."
    LivenessFailureReason.SPOOF_DETECTED.name -> "Liveness check failed."
    LivenessFailureReason.SESSION_EXPIRED.name -> "Session expired. Please try again."
    else -> "Liveness check did not pass."
  }
}
