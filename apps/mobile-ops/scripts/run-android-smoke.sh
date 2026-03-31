#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ANDROID_DIR="$ROOT_DIR/android"
ARTIFACT_DIR="$ROOT_DIR/dist/e2e/android-smoke"
GRADLE_HOME_DIR="$ROOT_DIR/.gradle"
SDK_CANDIDATES=()

if [[ -n "${ANDROID_SDK_ROOT:-}" ]]; then
  SDK_CANDIDATES+=("$ANDROID_SDK_ROOT")
fi
if [[ -n "${ANDROID_HOME:-}" ]]; then
  SDK_CANDIDATES+=("$ANDROID_HOME")
fi
SDK_CANDIDATES+=(
  "$HOME/Library/Android/sdk"
  "/usr/local/share/android-sdk"
  "/opt/homebrew/share/android-commandlinetools"
)

ANDROID_SDK_ROOT=""
for candidate in "${SDK_CANDIDATES[@]}"; do
  if [[ -x "$candidate/platform-tools/adb" && -x "$candidate/emulator/emulator" ]]; then
    ANDROID_SDK_ROOT="$candidate"
    break
  fi
done

if [[ -z "$ANDROID_SDK_ROOT" ]]; then
  echo "[android-smoke] Could not find a usable Android SDK. Checked:" >&2
  printf '  %s\n' "${SDK_CANDIDATES[@]}" >&2
  exit 1
fi

ADB="$ANDROID_SDK_ROOT/platform-tools/adb"
EMULATOR="$ANDROID_SDK_ROOT/emulator/emulator"
AVDMANAGER="$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/avdmanager"
AVD_NAME="${ANDROID_AVD_NAME:-Medium_Phone_API_35}"
PACKAGE_NAME="com.mobiris.mobileops"
MAIN_ACTIVITY="com.mobiris.mobileops.MainActivity"
APK_PATH="$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"
EMU_LOG="$ARTIFACT_DIR/emulator.log"

capture_screen() {
  local remote_path="$1"
  local local_path="$2"

  "$ADB" shell rm -f "$remote_path" >/dev/null 2>&1 || true
  "$ADB" shell screencap -p "$remote_path" >/dev/null
  "$ADB" pull "$remote_path" "$local_path" >/dev/null
}

install_with_retry() {
  local apk_path="$1"

  for _ in {1..10}; do
    if install_once_with_timeout "$apk_path"; then
      return 0
    fi
    sleep 3
  done

  return 1
}

install_once_with_timeout() {
  local apk_path="$1"
  local install_pid=""

  "$ADB" install --no-streaming -r "$apk_path" >/tmp/mobiris-android-install.log 2>&1 &
  install_pid=$!

  for _ in {1..20}; do
    if ! kill -0 "$install_pid" >/dev/null 2>&1; then
      wait "$install_pid"
      return $?
    fi
    sleep 3
  done

  kill "$install_pid" >/dev/null 2>&1 || true
  wait "$install_pid" >/dev/null 2>&1 || true
  return 1
}

can_launch_app() {
  "$ADB" shell am start -W -n "$PACKAGE_NAME/$MAIN_ACTIVITY" >/dev/null 2>&1
}

mkdir -p "$ARTIFACT_DIR" "$GRADLE_HOME_DIR"
export GRADLE_USER_HOME="$GRADLE_HOME_DIR"

for tool in "$ADB" "$EMULATOR" "$AVDMANAGER"; do
  if [[ ! -x "$tool" ]]; then
    echo "[android-smoke] Required Android SDK tool not found: $tool" >&2
    exit 1
  fi
done

if ! "$EMULATOR" -list-avds | grep -qx "$AVD_NAME"; then
  echo "[android-smoke] Android AVD '$AVD_NAME' not found. Available AVDs:" >&2
  "$AVDMANAGER" list avd >&2 || true
  exit 1
fi

echo "[android-smoke] Building debug APK"
pushd "$ANDROID_DIR" >/dev/null
./gradlew assembleDebug >/tmp/mobiris-android-smoke-build.log
popd >/dev/null

if [[ ! -f "$APK_PATH" ]]; then
  echo "[android-smoke] Debug APK not found at $APK_PATH" >&2
  exit 1
fi

echo "[android-smoke] Starting adb server"
"$ADB" start-server >/dev/null

EMULATOR_SERIAL="emulator-5554"

if "$ADB" devices | awk 'NR>1 {print $1}' | grep -qx "$EMULATOR_SERIAL"; then
  echo "[android-smoke] Restarting existing emulator session"
  "$ADB" -s "$EMULATOR_SERIAL" emu kill >/dev/null 2>&1 || true
  sleep 10
fi

echo "[android-smoke] Booting emulator $AVD_NAME"
nohup "$EMULATOR" -avd "$AVD_NAME" -no-snapshot-load -no-snapshot-save -no-boot-anim -no-audio -no-window >"$EMU_LOG" 2>&1 &

echo "[android-smoke] Waiting for emulator"
"$ADB" wait-for-device

BOOT_STATUS=""
for _ in {1..180}; do
  BOOT_STATUS="$("$ADB" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')"
  if [[ "$BOOT_STATUS" == "1" ]]; then
    break
  fi
  sleep 2
done

if [[ "$BOOT_STATUS" != "1" ]]; then
  echo "[android-smoke] Emulator did not finish booting" >&2
  exit 1
fi

for _ in {1..120}; do
  DEVICE_READY="$("$ADB" shell getprop dev.bootcomplete 2>/dev/null | tr -d '\r')"
  BOOT_ANIM="$("$ADB" shell getprop init.svc.bootanim 2>/dev/null | tr -d '\r')"
  if [[ "$DEVICE_READY" == "1" && "$BOOT_ANIM" == "stopped" ]]; then
    break
  fi
  sleep 2
done

sleep 10

"$ADB" shell input keyevent 82 >/dev/null 2>&1 || true

if can_launch_app; then
  echo "[android-smoke] App already installed on emulator, reusing existing debug install"
else
  echo "[android-smoke] Installing app"
  if ! install_with_retry "$APK_PATH" && ! can_launch_app; then
    echo "[android-smoke] App could not be installed or launched on the emulator" >&2
    if [[ -f /tmp/mobiris-android-install.log ]]; then
      cat /tmp/mobiris-android-install.log >&2
    fi
    exit 1
  fi
fi

echo "[android-smoke] Launching app"
"$ADB" shell am start -n "$PACKAGE_NAME/$MAIN_ACTIVITY" >/dev/null
sleep 5
capture_screen "/sdcard/01-home.png" "$ARTIFACT_DIR/01-home.png"

echo "[android-smoke] Opening self-service deep link"
"$ADB" shell am start -a android.intent.action.VIEW -d "mobiris://self-service/otp" "$PACKAGE_NAME" >/dev/null
sleep 3
capture_screen "/sdcard/02-self-service-otp.png" "$ARTIFACT_DIR/02-self-service-otp.png"

echo "[android-smoke] Opening guarantor deep link"
"$ADB" shell am start -a android.intent.action.VIEW -d "mobiris://guarantor-self-service" "$PACKAGE_NAME" >/dev/null
sleep 3
capture_screen "/sdcard/03-guarantor.png" "$ARTIFACT_DIR/03-guarantor.png"

echo "[android-smoke] Opening remittance history deep link"
"$ADB" shell am start -a android.intent.action.VIEW -d "mobiris://remittance/history" "$PACKAGE_NAME" >/dev/null
sleep 3
capture_screen "/sdcard/04-remittance-history.png" "$ARTIFACT_DIR/04-remittance-history.png"

echo "[android-smoke] Smoke run completed. Artifacts saved to $ARTIFACT_DIR"
