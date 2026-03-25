#!/usr/bin/env bash
# Local mobile build script — no EAS, no external services
# Usage:
#   ./scripts/build-mobile-local.sh android apk       → debug APK (arm64, fast)
#   ./scripts/build-mobile-local.sh android release   → release APK (arm64)
#   ./scripts/build-mobile-local.sh android aab       → release AAB (all archs, for Play Store)
#   ./scripts/build-mobile-local.sh ios device        → build + install on connected iPhone
#   ./scripts/build-mobile-local.sh ios sim           → build for simulator
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MOBILE_DIR="$REPO_ROOT/apps/mobile-ops"
ANDROID_DIR="$MOBILE_DIR/android"
IOS_DIR="$MOBILE_DIR/ios"
ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
OUTPUT_DIR="$REPO_ROOT/build-output"

PLATFORM="${1:-}"
TARGET="${2:-}"

usage() {
  echo "Usage: $0 <platform> <target>"
  echo ""
  echo "  $0 android apk       — debug APK, fast (arm64 only)"
  echo "  $0 android release   — release APK, signed with debug key (arm64)"
  echo "  $0 android aab       — release AAB, all archs (Play Store ready)"
  echo "  $0 ios device        — build Release + install on connected iPhone"
  echo "  $0 ios sim           — build for simulator"
  exit 1
}

[ -z "$PLATFORM" ] || [ -z "$TARGET" ] && usage

mkdir -p "$OUTPUT_DIR"

# ─── ANDROID ────────────────────────────────────────────────────────────────

if [ "$PLATFORM" = "android" ]; then
  export ANDROID_HOME

  echo "→ Checking Android SDK at $ANDROID_HOME"
  if [ ! -d "$ANDROID_HOME" ]; then
    echo "ERROR: Android SDK not found at $ANDROID_HOME"
    echo "Set ANDROID_HOME or install Android Studio."
    exit 1
  fi

  # pnpm install to make sure JS deps are up to date
  echo "→ Installing JS deps..."
  cd "$REPO_ROOT" && pnpm install --frozen-lockfile --silent

  case "$TARGET" in
    apk)
      echo "→ Building debug APK (arm64)..."
      cd "$ANDROID_DIR" && ./gradlew assembleDebug --no-daemon \
        -PreactNativeArchitectures=arm64-v8a \
        2>&1 | grep -E "BUILD|FAILED|error:|warning:|APK"
      APK_PATH=$(find "$ANDROID_DIR/app/build/outputs/apk/debug" -name "*.apk" | head -1)
      cp "$APK_PATH" "$OUTPUT_DIR/mobiris-debug.apk"
      echo ""
      echo "✓ APK ready: $OUTPUT_DIR/mobiris-debug.apk"
      ;;

    release)
      echo "→ Building release APK (arm64, debug-signed)..."
      cd "$ANDROID_DIR" && ./gradlew assembleRelease --no-daemon \
        -PreactNativeArchitectures=arm64-v8a \
        2>&1 | grep -E "BUILD|FAILED|error:|warning:|APK"
      APK_PATH=$(find "$ANDROID_DIR/app/build/outputs/apk/release" -name "*.apk" | head -1)
      cp "$APK_PATH" "$OUTPUT_DIR/mobiris-release.apk"
      echo ""
      echo "✓ APK ready: $OUTPUT_DIR/mobiris-release.apk"
      ;;

    aab)
      echo "→ Building release AAB (all archs — takes ~15 min)..."
      cd "$ANDROID_DIR" && ./gradlew bundleRelease --no-daemon \
        2>&1 | grep -E "BUILD|FAILED|error:|warning:|Bundle"
      AAB_PATH=$(find "$ANDROID_DIR/app/build/outputs/bundle/release" -name "*.aab" | head -1)
      cp "$AAB_PATH" "$OUTPUT_DIR/mobiris-release.aab"
      echo ""
      echo "✓ AAB ready: $OUTPUT_DIR/mobiris-release.aab"
      ;;

    *)
      echo "Unknown android target: $TARGET"
      usage
      ;;
  esac
fi

# ─── iOS ────────────────────────────────────────────────────────────────────

if [ "$PLATFORM" = "ios" ]; then
  if ! command -v xcodebuild &>/dev/null; then
    echo "ERROR: Xcode not found. Install Xcode from the App Store."
    exit 1
  fi

  # Install JS deps
  echo "→ Installing JS deps..."
  cd "$REPO_ROOT" && pnpm install --frozen-lockfile --silent

  # CocoaPods
  echo "→ Running pod install..."
  cd "$IOS_DIR" && pod install --silent

  WORKSPACE=$(ls "$IOS_DIR"/*.xcworkspace 2>/dev/null | head -1)
  if [ -z "$WORKSPACE" ]; then
    echo "ERROR: No .xcworkspace found after pod install."
    exit 1
  fi
  SCHEME=$(basename "$WORKSPACE" .xcworkspace)

  case "$TARGET" in
    device)
      echo "→ Building Release for connected device..."
      DEVICE_ID=$(xcrun devicectl list devices --quiet 2>/dev/null | grep -v "^$" | grep "connected" | head -1 | awk '{print $1}' || true)

      if [ -z "$DEVICE_ID" ]; then
        # Fallback: xcodebuild -destination to pick up any connected device
        echo "  No device via devicectl, using xcodebuild destination..."
        xcodebuild \
          -workspace "$WORKSPACE" \
          -scheme "$SCHEME" \
          -configuration Release \
          -destination "generic/platform=iOS" \
          -derivedDataPath "$OUTPUT_DIR/ios-derived" \
          archive \
          -archivePath "$OUTPUT_DIR/mobiris.xcarchive" \
          | xcpretty --color 2>/dev/null || cat
      else
        xcodebuild \
          -workspace "$WORKSPACE" \
          -scheme "$SCHEME" \
          -configuration Release \
          -destination "id=$DEVICE_ID" \
          -derivedDataPath "$OUTPUT_DIR/ios-derived" \
          | xcpretty --color 2>/dev/null || cat
      fi

      echo ""
      echo "✓ iOS build complete. App installed on connected device."
      ;;

    sim)
      echo "→ Building Debug for simulator..."
      SIM_ID=$(xcrun simctl list devices available 2>/dev/null | grep "iPhone" | grep -v "unavailable" | tail -1 | sed 's/.*(\(.*\))/\1/' | sed 's/ .*//')
      echo "  Simulator: $SIM_ID"
      xcodebuild \
        -workspace "$WORKSPACE" \
        -scheme "$SCHEME" \
        -configuration Debug \
        -destination "id=$SIM_ID" \
        -derivedDataPath "$OUTPUT_DIR/ios-derived" \
        build \
        | xcpretty --color 2>/dev/null || cat
      echo ""
      echo "✓ iOS simulator build complete."
      ;;

    *)
      echo "Unknown iOS target: $TARGET"
      usage
      ;;
  esac
fi
