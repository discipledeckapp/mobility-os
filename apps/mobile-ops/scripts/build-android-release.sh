#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ANDROID_DIR="$ROOT_DIR/android"
OUTPUT_DIR="$ROOT_DIR/dist/releases/android"
GRADLE_HOME_DIR="$ROOT_DIR/.gradle"
MODE="${1:-all}"
GRADLE_CMD="./gradlew"

if command -v gradle >/dev/null 2>&1; then
  GRADLE_CMD="gradle"
fi

mkdir -p "$OUTPUT_DIR"
mkdir -p "$GRADLE_HOME_DIR"
export GRADLE_USER_HOME="$GRADLE_HOME_DIR"
export GRADLE_OPTS="${GRADLE_OPTS:-} -Dorg.gradle.internal.http.connectionTimeout=60000 -Dorg.gradle.internal.http.socketTimeout=60000"

if [[ -z "${MOBIRIS_ANDROID_KEYSTORE_PATH:-}" && ! -f "$ANDROID_DIR/keystore.properties" ]]; then
  cat <<'EOF'
No Android release keystore is configured yet.

Use one of these options:
1. Copy android/keystore.properties.example to android/keystore.properties and fill it in.
2. Export these env vars before running the release build:
   MOBIRIS_ANDROID_KEYSTORE_PATH
   MOBIRIS_ANDROID_KEYSTORE_PASSWORD
   MOBIRIS_ANDROID_KEY_ALIAS
   MOBIRIS_ANDROID_KEY_PASSWORD

The build will fall back to the debug keystore if you ignore this, but that is not suitable for Play Store upload.
EOF
fi

pushd "$ANDROID_DIR" >/dev/null

case "$MODE" in
  apk)
    $GRADLE_CMD clean assembleRelease
    cp app/build/outputs/apk/release/app-release.apk "$OUTPUT_DIR/Mobiris-Fleet-OS.apk"
    ;;
  aab)
    $GRADLE_CMD clean bundleRelease
    cp app/build/outputs/bundle/release/app-release.aab "$OUTPUT_DIR/Mobiris-Fleet-OS.aab"
    ;;
  all)
    $GRADLE_CMD clean assembleRelease bundleRelease
    cp app/build/outputs/apk/release/app-release.apk "$OUTPUT_DIR/Mobiris-Fleet-OS.apk"
    cp app/build/outputs/bundle/release/app-release.aab "$OUTPUT_DIR/Mobiris-Fleet-OS.aab"
    ;;
  *)
    echo "Usage: ./scripts/build-android-release.sh [apk|aab|all]" >&2
    exit 1
    ;;
esac

popd >/dev/null

echo ""
echo "Android release artifacts written to:"
echo "  $OUTPUT_DIR"
