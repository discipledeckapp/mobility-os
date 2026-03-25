#!/usr/bin/env bash
# =============================================================================
# build-android.sh — Local Android release build + Play Store internal track
# No Expo cloud required. Requires JDK 17+, Android SDK, and a release keystore.
#
# Required env vars:
#   ANDROID_KEYSTORE_PATH      — Absolute path to your release.keystore file
#   ANDROID_KEYSTORE_PASSWORD  — Keystore password
#   ANDROID_KEY_ALIAS          — Key alias (default: mobiris)
#   ANDROID_KEY_PASSWORD       — Key password
#
# For Play Store upload (optional — skip by setting SKIP_UPLOAD=1):
#   GOOGLE_PLAY_SERVICE_ACCOUNT_JSON  — Path to Google Play service account JSON
#
# Optional:
#   VERSION_CODE   — Override android:versionCode (auto-increments from current)
#   SKIP_UPLOAD    — Set to 1 to build AAB without uploading
#
# First-time keystore generation (run once, keep the file safe):
#   keytool -genkey -v -keystore release.keystore \
#     -alias mobiris -keyalg RSA -keysize 2048 -validity 10000 \
#     -storepass <password> -keypass <password> \
#     -dname "CN=Mobiris Mobile Ops, OU=Engineering, O=Growth Figures Limited, L=Lagos, ST=Lagos, C=NG"
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ANDROID_DIR="$ROOT_DIR/android"
BUILD_DIR="$ROOT_DIR/build/android"
PACKAGE_NAME="com.mobiris.mobileops"

# ---- Validate required env ----
: "${ANDROID_KEYSTORE_PATH:?Required: export ANDROID_KEYSTORE_PATH=/path/to/release.keystore}"
: "${ANDROID_KEYSTORE_PASSWORD:?Required: export ANDROID_KEYSTORE_PASSWORD=yourpassword}"
: "${ANDROID_KEY_ALIAS:=mobiris}"
: "${ANDROID_KEY_PASSWORD:?Required: export ANDROID_KEY_PASSWORD=yourpassword}"

if [[ ! -f "$ANDROID_KEYSTORE_PATH" ]]; then
  echo "ERROR: Keystore not found at $ANDROID_KEYSTORE_PATH"
  echo ""
  echo "Generate one with:"
  echo "  keytool -genkey -v -keystore release.keystore \\"
  echo "    -alias mobiris -keyalg RSA -keysize 2048 -validity 10000 \\"
  echo "    -storepass <password> -keypass <password> \\"
  echo "    -dname \"CN=Mobiris Mobile Ops, OU=Engineering, O=Growth Figures Limited, L=Lagos, ST=Lagos, C=NG\""
  exit 1
fi

export ANDROID_KEYSTORE_PATH
export ANDROID_KEYSTORE_PASSWORD
export ANDROID_KEY_ALIAS
export ANDROID_KEY_PASSWORD

echo ""
echo "=== Mobiris Android Release Build ==="

# ---- Install JS deps ----
echo ">>> Installing JS dependencies..."
cd "$ROOT_DIR/../.."
pnpm install --frozen-lockfile
cd "$ROOT_DIR"

mkdir -p "$BUILD_DIR"

# ---- Build AAB ----
echo ">>> Building release AAB..."
cd "$ANDROID_DIR"
chmod +x gradlew
./gradlew bundleRelease \
  --no-daemon \
  -Pandroid.enableBundleCompression=false

AAB_PATH=$(find "$ANDROID_DIR/app/build/outputs/bundle/release" -name "*.aab" | head -1)
if [[ -z "$AAB_PATH" ]]; then
  echo "ERROR: AAB not found after build"
  exit 1
fi

cp "$AAB_PATH" "$BUILD_DIR/mobiris-mobile-ops-release.aab"
echo ">>> AAB ready: $BUILD_DIR/mobiris-mobile-ops-release.aab"

# ---- Upload to Play Store internal track ----
if [[ "${SKIP_UPLOAD:-0}" == "1" ]]; then
  echo ">>> Skipping Play Store upload (SKIP_UPLOAD=1)"
  echo ""
  echo "=== Done. Upload the AAB manually to the internal testing track. ==="
  exit 0
fi

: "${GOOGLE_PLAY_SERVICE_ACCOUNT_JSON:?Required for upload: export GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=/path/to/service-account.json}"

if ! command -v bundletool &> /dev/null; then
  echo ">>> bundletool not found. Falling back to curl-based upload..."
fi

echo ">>> Uploading to Play Store internal track..."

# Use gcloud / Google Play Developer API via service account
ACCESS_TOKEN=$(python3 - <<'PYEOF'
import json, sys, time, base64, hashlib, hmac
try:
    from google.oauth2 import service_account
    import google.auth.transport.requests
    creds = service_account.Credentials.from_service_account_file(
        "$GOOGLE_PLAY_SERVICE_ACCOUNT_JSON",
        scopes=["https://www.googleapis.com/auth/androidpublisher"]
    )
    creds.refresh(google.auth.transport.requests.Request())
    print(creds.token)
except ImportError:
    print("")
PYEOF
)

if [[ -z "$ACCESS_TOKEN" ]]; then
  echo "WARNING: google-auth Python library not available."
  echo "Install it with: pip3 install google-auth"
  echo ""
  echo "Alternatively, upload manually at:"
  echo "  https://play.google.com/console → Internal testing → Create new release"
  echo "  AAB: $BUILD_DIR/mobiris-mobile-ops-release.aab"
  exit 0
fi

# Create an edit
EDIT_RESPONSE=$(curl -sf -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://androidpublisher.googleapis.com/androidpublisher/v3/applications/$PACKAGE_NAME/edits")
EDIT_ID=$(echo "$EDIT_RESPONSE" | python3 -c "import json,sys; print(json.load(sys.stdin)['id'])")

# Upload AAB
curl -sf -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/octet-stream" \
  --data-binary "@$BUILD_DIR/mobiris-mobile-ops-release.aab" \
  "https://androidpublisher.googleapis.com/upload/androidpublisher/v3/applications/$PACKAGE_NAME/edits/$EDIT_ID/bundles?uploadType=media" \
  > /dev/null

# Assign to internal track
AAB_VERSION=$(cat "$ANDROID_DIR/app/build.gradle" | grep versionCode | head -1 | tr -dc '0-9')
curl -sf -X PUT \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"releases\":[{\"status\":\"completed\",\"versionCodes\":[\"$AAB_VERSION\"]}]}" \
  "https://androidpublisher.googleapis.com/androidpublisher/v3/applications/$PACKAGE_NAME/edits/$EDIT_ID/tracks/internal" \
  > /dev/null

# Commit the edit
curl -sf -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  "https://androidpublisher.googleapis.com/androidpublisher/v3/applications/$PACKAGE_NAME/edits/$EDIT_ID:commit" \
  > /dev/null

echo ""
echo "=== Done. AAB (versionCode $AAB_VERSION) submitted to Play Store internal testing. ==="
echo "Check at: https://play.google.com/console"
