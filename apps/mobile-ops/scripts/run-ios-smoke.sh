#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
IOS_DIR="$ROOT_DIR/ios"
WORKSPACE="$IOS_DIR/MobirisMobileOps.xcworkspace"
SCHEME="MobirisMobileOps"
BUNDLE_ID="com.mobiris.mobileops"
SIM_NAME="${IOS_SIM_NAME:-iPhone 16}"
SIM_OS="${IOS_SIM_OS:-18.2}"
DESTINATION="platform=iOS Simulator,name=${SIM_NAME},OS=${SIM_OS}"
DERIVED_DATA="$ROOT_DIR/dist/e2e/ios-derived-data"
ARTIFACT_DIR="$ROOT_DIR/dist/e2e/ios-smoke"

mkdir -p "$ARTIFACT_DIR"

echo "[ios-smoke] Building $SCHEME for $DESTINATION"
xcodebuild \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration Debug \
  -destination "$DESTINATION" \
  -derivedDataPath "$DERIVED_DATA" \
  build >/tmp/mobiris-ios-smoke-build.log

APP_PATH="$(find "$DERIVED_DATA/Build/Products" -maxdepth 2 -name '*.app' | head -n 1)"
if [[ -z "${APP_PATH:-}" ]]; then
  echo "[ios-smoke] Could not locate built .app inside $DERIVED_DATA" >&2
  exit 1
fi

SIM_UDID="$(xcrun simctl list devices available | awk -v name="$SIM_NAME" -v os="$SIM_OS" '
  $0 ~ ("-- iOS " os " --") {capture=1; next}
  /^--/ {capture=0}
  capture && index($0, name) {
    if (match($0, /\([0-9A-F-]{36}\)/)) {
      print substr($0, RSTART + 1, RLENGTH - 2)
      exit
    }
  }
')"

if [[ -z "${SIM_UDID:-}" ]]; then
  echo "[ios-smoke] Could not resolve simulator UDID for $DESTINATION" >&2
  exit 1
fi

echo "[ios-smoke] Booting simulator $SIM_NAME ($SIM_UDID)"
xcrun simctl boot "$SIM_UDID" >/dev/null 2>&1 || true
xcrun simctl bootstatus "$SIM_UDID" -b

echo "[ios-smoke] Installing app from $APP_PATH"
xcrun simctl install "$SIM_UDID" "$APP_PATH"

echo "[ios-smoke] Launching app"
xcrun simctl launch "$SIM_UDID" "$BUNDLE_ID" >"$ARTIFACT_DIR/launch.txt"
sleep 4
xcrun simctl io "$SIM_UDID" screenshot "$ARTIFACT_DIR/01-home.png" >/dev/null

echo "[ios-smoke] Opening self-service deep link"
xcrun simctl openurl "$SIM_UDID" "mobiris://self-service/otp"
sleep 3
xcrun simctl io "$SIM_UDID" screenshot "$ARTIFACT_DIR/02-self-service-otp.png" >/dev/null

echo "[ios-smoke] Opening guarantor deep link"
xcrun simctl openurl "$SIM_UDID" "mobiris://guarantor-self-service"
sleep 3
xcrun simctl io "$SIM_UDID" screenshot "$ARTIFACT_DIR/03-guarantor.png" >/dev/null

echo "[ios-smoke] Opening remittance history deep link"
xcrun simctl openurl "$SIM_UDID" "mobiris://remittance/history"
sleep 3
xcrun simctl io "$SIM_UDID" screenshot "$ARTIFACT_DIR/04-remittance-history.png" >/dev/null

echo "[ios-smoke] Smoke run completed. Artifacts saved to $ARTIFACT_DIR"
