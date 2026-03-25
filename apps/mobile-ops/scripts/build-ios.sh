#!/usr/bin/env bash
# =============================================================================
# build-ios.sh — Local iOS release build + TestFlight upload
# No Expo cloud required. Requires Xcode 15+, CocoaPods, and an active Apple
# Distribution certificate in your keychain.
#
# Required env vars (export or put in .env.build):
#   APPLE_TEAM_ID          — 10-char Apple Developer Team ID
#   ASC_API_KEY_ID         — App Store Connect API Key ID
#   ASC_API_KEY_ISSUER_ID  — App Store Connect API Issuer ID
#   ASC_API_KEY_PATH       — Path to the .p8 private key file
#
# Optional:
#   BUILD_NUMBER           — Override CFBundleVersion (defaults to timestamp)
#   SKIP_POD_INSTALL       — Set to 1 to skip pod install
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
IOS_DIR="$ROOT_DIR/ios"
BUILD_DIR="$ROOT_DIR/build/ios"
SCHEME="MobirisMobileOps"
WORKSPACE="$IOS_DIR/$SCHEME.xcworkspace"
ARCHIVE_PATH="$BUILD_DIR/$SCHEME.xcarchive"
EXPORT_PATH="$BUILD_DIR/export"
EXPORT_OPTIONS="$IOS_DIR/ExportOptions.plist"

# ---- Validate required env ----
: "${APPLE_TEAM_ID:?Required: export APPLE_TEAM_ID=XXXXXXXXXX}"
: "${ASC_API_KEY_ID:?Required: export ASC_API_KEY_ID=XXXXXXXXXX}"
: "${ASC_API_KEY_ISSUER_ID:?Required: export ASC_API_KEY_ISSUER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx}"
: "${ASC_API_KEY_PATH:?Required: export ASC_API_KEY_PATH=/path/to/AuthKey_XXXXXXXXXX.p8}"

BUILD_NUMBER="${BUILD_NUMBER:-$(date +%Y%m%d%H%M)}"

echo ""
echo "=== Mobiris iOS Release Build ==="
echo "Scheme:       $SCHEME"
echo "Build number: $BUILD_NUMBER"
echo "Archive:      $ARCHIVE_PATH"
echo ""

# ---- Patch ExportOptions teamID ----
sed -i '' "s/\$(APPLE_TEAM_ID)/$APPLE_TEAM_ID/g" "$EXPORT_OPTIONS"

mkdir -p "$BUILD_DIR"

# ---- Install JS deps ----
echo ">>> Installing JS dependencies..."
cd "$ROOT_DIR/../.."
pnpm install --frozen-lockfile
cd "$ROOT_DIR"

# ---- Pod install ----
if [[ "${SKIP_POD_INSTALL:-0}" != "1" ]]; then
  echo ">>> Running pod install..."
  cd "$IOS_DIR"
  pod install --repo-update
  cd "$ROOT_DIR"
fi

# ---- Archive ----
echo ">>> Archiving..."
xcodebuild archive \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration Release \
  -archivePath "$ARCHIVE_PATH" \
  -destination "generic/platform=iOS" \
  CURRENT_PROJECT_VERSION="$BUILD_NUMBER" \
  MARKETING_VERSION="1.0.0" \
  DEVELOPMENT_TEAM="$APPLE_TEAM_ID" \
  CODE_SIGN_STYLE=Automatic \
  -allowProvisioningUpdates \
  | xcpretty || true

if [[ ! -d "$ARCHIVE_PATH" ]]; then
  echo "ERROR: Archive not found at $ARCHIVE_PATH"
  exit 1
fi

# ---- Export IPA ----
echo ">>> Exporting IPA..."
xcodebuild -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportPath "$EXPORT_PATH" \
  -exportOptionsPlist "$EXPORT_OPTIONS" \
  -allowProvisioningUpdates \
  | xcpretty || true

IPA_PATH=$(find "$EXPORT_PATH" -name "*.ipa" | head -1)
if [[ -z "$IPA_PATH" ]]; then
  echo "ERROR: IPA not found in $EXPORT_PATH"
  exit 1
fi

echo ">>> IPA ready: $IPA_PATH"

# ---- Upload to TestFlight ----
echo ">>> Uploading to TestFlight..."
xcrun altool \
  --upload-app \
  --type ios \
  --file "$IPA_PATH" \
  --apiKey "$ASC_API_KEY_ID" \
  --apiIssuer "$ASC_API_KEY_ISSUER_ID" \
  --private-key "$(cat "$ASC_API_KEY_PATH")" \
  --output-format xml

echo ""
echo "=== Done. Build $BUILD_NUMBER submitted to TestFlight. ==="
echo "Check processing status at https://appstoreconnect.apple.com"
