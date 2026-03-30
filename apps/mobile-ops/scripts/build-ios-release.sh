#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
IOS_DIR="$ROOT_DIR/ios"
WORKSPACE="$IOS_DIR/MobirisMobileOps.xcworkspace"
SCHEME="MobirisMobileOps"
ARCHIVE_DIR="$ROOT_DIR/dist/releases/ios"
ARCHIVE_PATH="$ARCHIVE_DIR/Mobiris Fleet OS.xcarchive"
EXPORT_PATH="$ARCHIVE_DIR/export"
EXPORT_OPTIONS_PLIST="$ROOT_DIR/ios/exportOptions.plist"
MODE="${1:-archive}"

mkdir -p "$ARCHIVE_DIR"

pushd "$IOS_DIR" >/dev/null

if [[ ! -d Pods ]]; then
  pod install
fi

case "$MODE" in
  archive)
    xcodebuild \
      -workspace "$WORKSPACE" \
      -scheme "$SCHEME" \
      -configuration Release \
      -destination "generic/platform=iOS" \
      -archivePath "$ARCHIVE_PATH" \
      archive
    echo ""
    echo "iOS archive written to:"
    echo "  $ARCHIVE_PATH"
    ;;
  export)
    if [[ ! -d "$ARCHIVE_PATH" ]]; then
      echo "Archive not found at $ARCHIVE_PATH. Run release:ios:archive first." >&2
      exit 1
    fi
    if [[ ! -f "$EXPORT_OPTIONS_PLIST" ]]; then
      echo "exportOptions.plist not found at $EXPORT_OPTIONS_PLIST." >&2
      exit 1
    fi
    xcodebuild \
      -exportArchive \
      -archivePath "$ARCHIVE_PATH" \
      -exportPath "$EXPORT_PATH" \
      -exportOptionsPlist "$EXPORT_OPTIONS_PLIST"
    echo ""
    echo "iOS export written to:"
    echo "  $EXPORT_PATH"
    ;;
  *)
    echo "Usage: ./scripts/build-ios-release.sh [archive|export]" >&2
    exit 1
    ;;
esac

popd >/dev/null
