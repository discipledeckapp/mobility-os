import ExpoModulesCore
import AzureAIVisionFaceUI   // CocoaPod: pod 'AzureAIVisionFaceUI', '~> 0.19.0-beta'
import SwiftUI
import UIKit

// ---------------------------------------------------------------------------
// YouVerifyLivenessModule
//
// Wraps the Azure AI Vision Face Liveness Detection SDK so that React Native
// can launch a native face liveness challenge with a single JS call.
//
// The sessionToken is an Azure Face API JWT issued by YouVerify's backend
// (POST /v2/api/identity/sdk/liveness/token). It is passed directly to the
// Azure Face Liveness SDK — no additional credential handling needed here.
//
// Requires iOS 15+ (set in Podfile / Deployment Target).
// Requires NSCameraUsageDescription in Info.plist.
// ---------------------------------------------------------------------------

public class YouVerifyLivenessModule: Module {
  private var hasCompleted = false

  public func definition() -> ModuleDefinition {
    Name("YouVerifyLiveness")

    AsyncFunction("startLiveness") { (options: [String: Any], promise: Promise) in
      guard
        let sessionId = options["sessionId"] as? String, !sessionId.isEmpty,
        let sessionToken = options["sessionToken"] as? String, !sessionToken.isEmpty
      else {
        promise.reject("INVALID_INPUT", "sessionId and sessionToken are required")
        return
      }

      let sandbox = options["sandbox"] as? Bool ?? true

      DispatchQueue.main.async {
        self.launchLiveness(
          sessionId: sessionId,
          sessionToken: sessionToken,
          sandbox: sandbox,
          promise: promise
        )
      }
    }
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  private func launchLiveness(
    sessionId: String,
    sessionToken: String,
    sandbox: Bool,
    promise: Promise
  ) {
    hasCompleted = false

    guard let rootVC = currentRootViewController() else {
      promise.reject("NO_ROOT_VC", "Unable to find root view controller")
      return
    }

    // Build the Azure Face Liveness session configuration.
    // AzureAIVisionFaceUI.FaceAnalyzerCreateSession is the entry point.
    // Reference: https://github.com/Azure-Samples/azure-ai-vision-sdk
    let config = VisionServiceOptions()
    // The sessionToken is the Azure Face API auth token.
    // It already encodes the endpoint and session constraints.
    let sessionOptions = FaceSessionOptions()
    sessionOptions.setAuthToken(sessionToken)

    // Create and start the liveness session.
    FaceAnalyzer.create(
      serviceOptions: config,
      input: .cameraInput,
      completionHandler: { [weak self] faceAnalyzer, error in
        if let error = error {
          promise.reject("SDK_INIT_FAILED", error.localizedDescription)
          return
        }

        guard let analyzer = faceAnalyzer else {
          promise.reject("SDK_INIT_FAILED", "FaceAnalyzer could not be created")
          return
        }

        // FaceAnalyzerView is the SwiftUI/UIKit view that hosts the camera + challenge.
        let faceView = FaceAnalyzerView(analyzer: analyzer)
        let hostingVC = UIHostingController(rootView: faceView)
        hostingVC.modalPresentationStyle = .fullScreen

        // Observe the liveness result.
        analyzer.resultReceived = { result in
          DispatchQueue.main.async {
            guard !self.hasCompleted else {
              return
            }
            self.hasCompleted = true
            hostingVC.dismiss(animated: true) {
              let passed = result.livenessDecision == .realFace
              let faceImageB64 = result.detectedFaces?.first?.boundingBox != nil
                ? self?.extractFaceImage(from: result)
                : nil

              let output: [String: Any?] = [
                "passed": passed,
                "faceImageB64": faceImageB64,
                "sessionId": sessionId,
                "errorCode": passed ? nil : "LIVENESS_FAILED",
                "errorMessage": passed ? nil : "Liveness check did not pass",
              ]
              promise.resolve(output.compactMapValues { $0 })
            }
          }
        }

        // Handle session errors (expired token, network, camera denied, etc.).
        analyzer.sessionCompleted = { session, error in
          if let error = error {
            DispatchQueue.main.async {
              guard !self.hasCompleted else {
                return
              }
              self.hasCompleted = true
              hostingVC.dismiss(animated: true) {
                let nsError = error as NSError
                promise.reject(
                  nsError.domain,
                  error.localizedDescription
                )
              }
            }
          }
        }

        rootVC.present(hostingVC, animated: true)

        // Start the liveness session using the Azure Face token.
        do {
          try analyzer.startAnalyzing(
            usingSessionAuthorizationToken: sessionToken
          )
        } catch {
          hostingVC.dismiss(animated: true)
          promise.reject("SESSION_START_FAILED", error.localizedDescription)
        }
      }
    )
  }

  private func extractFaceImage(from result: FaceAnalysisResult) -> String? {
    guard
      let imageData = result.detectedFaces?.first?.largestFace?.image?.pngData()
    else {
      return nil
    }
    return imageData.base64EncodedString()
  }

  private func currentRootViewController() -> UIViewController? {
    let scene = UIApplication.shared.connectedScenes
      .compactMap { $0 as? UIWindowScene }
      .first { $0.activationState == .foregroundActive }

    let root = scene?.windows.first(where: \.isKeyWindow)?.rootViewController
    return topViewController(from: root)
  }

  private func topViewController(from root: UIViewController?) -> UIViewController? {
    if let navigationController = root as? UINavigationController {
      return topViewController(from: navigationController.visibleViewController)
    }
    if let tabBarController = root as? UITabBarController {
      return topViewController(from: tabBarController.selectedViewController)
    }
    if let presented = root?.presentedViewController {
      return topViewController(from: presented)
    }
    return root
  }
}
