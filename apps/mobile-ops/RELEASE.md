# Mobiris Fleet OS Local Release Guide

This app can now be built locally on this machine without EAS.

## App Identity

- App name: `Mobiris Fleet OS`
- Android package: `com.mobiris.mobileops`
- iOS bundle identifier: `com.mobiris.mobileops`

## Android local release

### 1. Configure a release keystore

Copy:

```bash
cp android/keystore.properties.example android/keystore.properties
```

Then update `android/keystore.properties` with your real keystore values.

You can also use environment variables instead:

- `MOBIRIS_ANDROID_KEYSTORE_PATH`
- `MOBIRIS_ANDROID_KEYSTORE_PASSWORD`
- `MOBIRIS_ANDROID_KEY_ALIAS`
- `MOBIRIS_ANDROID_KEY_PASSWORD`

### 2. Build artifacts

From `apps/mobile-ops`:

```bash
pnpm release:android:apk
pnpm release:android:aab
pnpm release:android
```

Artifacts are written to:

- `dist/releases/android/Mobiris-Fleet-OS.apk`
- `dist/releases/android/Mobiris-Fleet-OS.aab`

## iOS local release

### 1. Open Xcode

```bash
pnpm release:ios:xcode
```

This opens:

- `ios/MobirisMobileOps.xcworkspace`

### 2. Set signing

In Xcode:

- select the `MobirisMobileOps` target
- set your Apple Team
- keep automatic signing enabled
- verify the bundle identifier is correct

### 3. Create a local archive

```bash
pnpm release:ios:archive
```

Archive output:

- `dist/releases/ios/Mobiris Fleet OS.xcarchive`

### 4. Export / upload without EAS

Update:

- `ios/exportOptions.plist`

Set your real `teamID`, then run:

```bash
pnpm release:ios:export
```

Or use Xcode Organizer directly after archiving:

- `Window -> Organizer`
- choose the new archive
- `Distribute App`

This is the simplest local path for App Store Connect upload without EAS.

## Deep linking

The app is configured for:

- `mobiris://...`
- `mobiris-mobile-ops://...`
- `https://app.mobiris.ng/...`

## Notes

- Android release builds fall back to the debug keystore if you do not configure a release keystore. That is only acceptable for local install testing, not for Play Store submission.
- iOS distribution still requires a valid Apple signing setup on this Mac.
