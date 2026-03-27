# Mobile Ops

`mobile-ops` is the first React Native + Expo bare-workflow app for Mobility OS field operations.

Current scope:
- tenant JWT login
- silent access-token refresh with refresh-token rotation
- current driver assignment view
- assignment lifecycle actions
- remittance capture
- driver verification status
- offline queueing for assignment and remittance actions
- lightweight mobile error reporting to `api-core`
- deep-link routing for assignments, remittance, and profile

This app stays inside the tenant operations plane and talks only to `api-core`.

Committed native projects live in:
- `apps/mobile-ops/ios`
- `apps/mobile-ops/android`

## Setup

From the repo root:

```bash
pnpm install
pnpm --filter mobile-ops start
```

Optional environment:

```bash
EXPO_PUBLIC_API_URL=http://localhost:3001/api/v1
EXPO_PUBLIC_ENABLE_OFFLINE_QUEUE=true
EXPO_PUBLIC_ENABLE_CRASH_REPORTING=false
```

Environment presets are checked into:
- `.env.development`
- `.env.staging`
- `.env.production`

Switch environments by exporting the matching `EXPO_PUBLIC_*` variables before starting Expo, for example:

```bash
EXPO_PUBLIC_API_URL=http://localhost:3001/api/v1 pnpm --filter mobile-ops start
```

Run the committed native projects with:

```bash
pnpm --filter mobile-ops ios
pnpm --filter mobile-ops android
```

Refresh the native scaffold after Expo config or plugin changes with:

```bash
pnpm --filter mobile-ops prebuild
```

## Build And Release

Generate a local Android release APK from the committed native project with:

```bash
cd apps/mobile-ops/android
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
export ANDROID_HOME="$HOME/Library/Android/sdk"
export ANDROID_SDK_ROOT="$HOME/Library/Android/sdk"
./gradlew --no-daemon assembleRelease -PreactNativeArchitectures=arm64-v8a
```

The APK is written to:
- `apps/mobile-ops/android/app/build/outputs/apk/release/app-release.apk`

For cloud builds, the `Mobile Build` GitHub workflow supports:
- Android and iOS EAS builds
- iOS production builds with `submit_to_testflight=true`, which enables `eas build --auto-submit`
- Android production builds with `submit_to_play=true`, which enables `eas build --auto-submit` to the Google Play `internal` track

TestFlight releases require:
- `platform=ios`
- `profile=production`
- a valid `EXPO_TOKEN` in GitHub Actions
- the Apple credentials configured in the Expo project for submit

Google Play internal testing releases require:
- `platform=android`
- `profile=production`
- `submit_to_play=true`
- a `GOOGLE_PLAY_SERVICE_ACCOUNT_KEY` GitHub secret containing the raw JSON for a Play Console service account key
- the `com.mobiris.mobileops` app to exist in Google Play Console before API submissions
- tester emails to be added in Play Console under the internal testing track

The production Android submit profile is configured to target the `internal` testing track by default.

## Current API Calls

- `POST /auth/login`
- `POST /auth/refresh`
- `GET /auth/session`
- `GET /mobile-ops/assignments`
- `GET /mobile-ops/assignments/:id`
- `POST /mobile-ops/assignments/:id/start`
- `POST /mobile-ops/assignments/:id/complete`
- `POST /mobile-ops/assignments/:id/cancel`
- `GET /mobile-ops/profile`
- `POST /mobile-ops/remittance`
- `POST /mobile/log`

## Deep Links

- `mobiris://assignment/:assignmentId`
- `mobiris://remittance/:assignmentId`
- `mobiris://profile`

The canonical mobile link contract now lives in:
- [linking.ts](/Users/seyiadelaju/mobility-os/apps/mobile-ops/src/navigation/linking.ts)

Use the exported builders there when notifications or external entry points need to target a screen.

## Known Limitations

- Offline queue is action-based and does not yet provide a full local-first cache
- No push notifications yet
- No camera/selfie capture yet
- Driver mobile access uses a tenant user account linked explicitly to a driver record
- Assignment cards can only show fields currently stored in `api-core`; pickup/drop-off is not modeled there yet
- Crash reporting is backend-log based for now; Sentry-grade crash aggregation is still a follow-up
