# BlastMyCV — EAS Build & Deployment Guide

This guide covers everything needed to build and publish BlastMyCV to the
Apple App Store (TestFlight) and Google Play using Expo EAS, from any
environment: your local machine or a CI/CD pipeline (GitHub Actions).

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Project Setup](#initial-project-setup)
3. [Required Secrets](#required-secrets)
   - [iOS — Apple Credentials](#ios--apple-credentials)
   - [Android — Google Play Credentials](#android--google-play-credentials)
4. [Local Build & Submit (EAS CLI)](#local-build--submit-eas-cli)
   - [iOS Build → TestFlight](#ios-build--testflight)
   - [Android Build → Google Play](#android-build--google-play)
5. [CI/CD with GitHub Actions](#cicd-with-github-actions)
6. [Build Profiles](#build-profiles)
7. [Environment Variables](#environment-variables)
8. [Versioning](#versioning)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | 20+ | https://nodejs.org |
| pnpm | 10+ | `npm i -g pnpm` |
| EAS CLI | 14+ | `npm i -g eas-cli` |
| Expo account | — | https://expo.dev/signup |
| Apple Developer account | $99/yr | https://developer.apple.com |
| Google Play Console account | $25 one-time | https://play.google.com/console |

---

## Initial Project Setup

These steps are run **once** when first setting up EAS for this project.

### 1. Log in to Expo

```bash
eas login
```

### 2. Initialize EAS for this project

```bash
cd artifacts/blastmycv-mobile
eas init
```

This creates your project on expo.dev and writes the `projectId` into `app.json`.
**After running this, replace `REPLACE_WITH_YOUR_EAS_PROJECT_ID` in `app.json`
with the real ID printed by the command.**

### 3. Configure credentials (first time only)

```bash
# iOS — lets EAS manage provisioning profiles and certificates
eas credentials --platform ios

# Android — generates a keystore and saves it securely in EAS
eas credentials --platform android
```

> EAS stores credentials securely on Expo's servers — you never need to check
> certificates or keystores into your repository.

---

## Required Secrets

**Never hardcode any of these in files.** Use the methods below.

---

### iOS — Apple Credentials

Apple recommends using an **App Store Connect API Key** instead of a password.
This is more secure and works in CI/CD without 2FA interruptions.

#### Step 1 — Create an App Store Connect API Key

1. Go to **App Store Connect → Users and Access → Keys**
2. Click **+** and create a key with the **Developer** role
3. Download the `.p8` file — **you can only download it once**
4. Note the **Key ID** and **Issuer ID**

#### Step 2 — Find your Apple Team ID

1. Go to https://developer.apple.com/account
2. Your Team ID is displayed under **Membership** (format: `XXXXXXXXXX`)

#### Step 3 — Register required values

| Secret Name | Where to find it | Description |
|---|---|---|
| `EXPO_TOKEN` | expo.dev → Account Settings → Access Tokens | EAS authentication token |
| `ASC_API_KEY_CONTENT` | The `.p8` file content | App Store Connect API key (full file content) |
| `ASC_KEY_ID` | App Store Connect → Keys | API Key ID (10-char string) |
| `ASC_ISSUER_ID` | App Store Connect → Keys (top of page) | UUID of your team's issuer |
| `APPLE_TEAM_ID` | developer.apple.com → Membership | 10-char alphanumeric team ID |

#### Store as EAS secrets (for local use)

```bash
eas secret:create --scope project --name ASC_KEY_ID --value "YOUR_KEY_ID"
eas secret:create --scope project --name ASC_ISSUER_ID --value "YOUR_ISSUER_ID"
eas secret:create --scope project --name APPLE_TEAM_ID --value "YOUR_TEAM_ID"
eas secret:create --scope project --name ASC_API_KEY_CONTENT --value "$(cat /path/to/AuthKey_XXXXXXXX.p8)"
```

#### Store as GitHub Actions secrets (for CI/CD)

In your GitHub repo: **Settings → Secrets and variables → Actions → New secret**

Add each of the secrets in the table above using the exact names shown.

---

### Android — Google Play Credentials

#### Step 1 — Create a Service Account

1. Go to **Google Play Console → Setup → API access**
2. Link to a **Google Cloud project** (or create one)
3. Click **Create new service account** → follow the link to Google Cloud Console
4. In Google Cloud: **IAM → Service Accounts → Create**
   - Name: `blastmycv-play-deploy`
   - Role: **Service Account User**
5. Create a JSON key: **Keys → Add Key → Create new key → JSON**
6. Download the `.json` file
7. Back in Play Console: **Grant access** to this service account with
   **Release Manager** permissions

#### Step 2 — Register required values

| Secret Name | Description |
|---|---|
| `EXPO_TOKEN` | EAS authentication token |
| `GOOGLE_SERVICE_ACCOUNT_KEY_JSON` | Full content of the service account `.json` file |

#### Store as EAS secret

```bash
eas secret:create --scope project --name GOOGLE_SERVICE_ACCOUNT_KEY_JSON \
  --value "$(cat /path/to/service-account.json)"
```

#### Store as GitHub Actions secret

Add `GOOGLE_SERVICE_ACCOUNT_KEY_JSON` in GitHub → Settings → Secrets → Actions.

---

## Local Build & Submit (EAS CLI)

Run these commands from `artifacts/blastmycv-mobile/`.

```bash
cd artifacts/blastmycv-mobile
```

### iOS Build → TestFlight

#### Step 1 — Build

```bash
# Production build for App Store
eas build --platform ios --profile production

# Preview/internal build (no App Store review needed)
eas build --platform ios --profile preview
```

EAS runs the build on Expo's cloud servers — no Mac required locally.
You'll get a link to track progress at expo.dev.

#### Step 2 — Submit to TestFlight

```bash
# Submit the most recent build
eas submit --platform ios --profile production --latest

# Or submit a specific build by ID
eas submit --platform ios --id YOUR_BUILD_ID
```

Before submitting, ensure you have:
- Set `ASC_API_KEY_PATH`, `ASC_KEY_ID`, `ASC_ISSUER_ID`, `APPLE_TEAM_ID`
  as environment variables **or** as EAS secrets

#### Full iOS flow in one command

```bash
# Build and submit in sequence
eas build --platform ios --profile production --auto-submit
```

---

### Android Build → Google Play

#### Step 1 — Build

```bash
# Production .aab for Google Play
eas build --platform android --profile production

# Preview .apk for internal testing
eas build --platform android --profile preview
```

#### Step 2 — Submit to Google Play Internal Testing

```bash
eas submit --platform android --profile production --latest
```

This uploads the `.aab` to the **Internal Testing** track on Google Play.
After review, you can promote it to Alpha → Beta → Production from the
Google Play Console.

#### Full Android flow in one command

```bash
eas build --platform android --profile production --auto-submit
```

---

## CI/CD with GitHub Actions

The workflow file is at:
```
artifacts/blastmycv-mobile/.github/workflows/eas-build.yml
```

> **Note:** Move this file to `.github/workflows/eas-build.yml` at the
> **root of your Git repository** for GitHub Actions to detect it.

### Triggers

| Trigger | What happens |
|---|---|
| Push to `main` | Nothing (builds only on tags) |
| Push a tag `v*` (e.g. `v1.0.0`) | Build + submit both platforms |
| Manual dispatch | Choose platform, profile, and whether to submit |

### How to trigger a release

```bash
git tag v1.0.0
git push origin v1.0.0
```

This triggers a full build + submit for both iOS and Android automatically.

### Required GitHub Secrets

Add all of these under **GitHub → Settings → Secrets and variables → Actions**:

| Secret | Required for |
|---|---|
| `EXPO_TOKEN` | Both platforms |
| `ASC_API_KEY_CONTENT` | iOS only |
| `ASC_KEY_ID` | iOS only |
| `ASC_ISSUER_ID` | iOS only |
| `APPLE_TEAM_ID` | iOS only |
| `GOOGLE_SERVICE_ACCOUNT_KEY_JSON` | Android only |

---

## Build Profiles

Defined in `eas.json`:

| Profile | iOS output | Android output | Distribution | Use case |
|---|---|---|---|---|
| `development` | Simulator build | `.apk` debug | Internal | Local dev & testing |
| `preview` | `.ipa` (device) | `.apk` | Internal (no store review) | QA team testing |
| `production` | `.ipa` (store) | `.aab` | App Store / Google Play | Public release |

---

## Environment Variables

| Variable | Value | Set in |
|---|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | `https://blastmycv.com` | `eas.json` build env |
| `EXPO_TOKEN` | Your token | EAS secret / GitHub secret |
| `ASC_KEY_ID` | Apple Key ID | EAS secret / GitHub secret |
| `ASC_ISSUER_ID` | Apple Issuer UUID | EAS secret / GitHub secret |
| `ASC_API_KEY_CONTENT` | `.p8` file content | EAS secret / GitHub secret |
| `APPLE_TEAM_ID` | Apple Team ID | EAS secret / GitHub secret |
| `GOOGLE_SERVICE_ACCOUNT_KEY_JSON` | Service account JSON | EAS secret / GitHub secret |

`EXPO_PUBLIC_*` variables are bundled into the app at build time and visible
to app code. All other variables are build-time only and never included in
the app binary.

---

## Versioning

The app uses `"policy": "appVersion"` for `runtimeVersion`, meaning OTA
updates are compatible within the same `version` string.

### To release a new version

1. Bump `version` (and `ios.buildNumber` / `android.versionCode`) in `app.json`
2. Commit and push a new tag: `git tag v1.1.0 && git push origin v1.1.0`
3. CI/CD builds and submits automatically

### Auto-increment (EAS managed)

The `production` build profile has `"autoIncrement": true`, which means EAS
automatically increments `buildNumber` (iOS) and `versionCode` (Android)
on each build — no manual edits needed.

---

## Troubleshooting

### `projectId` is a placeholder

Run `eas init` inside `artifacts/blastmycv-mobile` and replace
`REPLACE_WITH_YOUR_EAS_PROJECT_ID` in `app.json` with the generated ID.

### iOS: "No credentials found"

Make sure you've run `eas credentials --platform ios` or that your
`ASC_API_KEY_*` secrets are correctly set.

### Android: "Service account does not have permission"

In Google Play Console, make sure the service account has been granted
**Release Manager** access to your app.

### Build takes too long

EAS builds run on Expo's cloud — iOS builds typically take 10–20 minutes.
Use `--no-wait` to trigger and check status later at expo.dev.

### CORS errors in Replit web preview

Expected and harmless — CORS only affects the browser web preview.
On real iOS/Android devices these errors do not occur.

### Changing bundle identifiers

Once submitted to the App Store or Google Play, bundle identifiers
(`com.blastmycv.mobile`) **cannot be changed**. Do not modify them.
