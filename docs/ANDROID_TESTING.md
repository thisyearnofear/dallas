# Android Testing Without a Physical Device

You don't need a Seeker or any Android phone to test the app. Choose the path that works best for you:

- **Option A (Recommended): Online cloud devices** — no install, runs in your browser
- **Option B: Android Studio emulator** — local, full MWA support, required for real on-chain tx

---

## Option A: Online Cloud Testing (No Install Required)

### BrowserStack App Live — Best for Demo Recording
**https://www.browserstack.com/app-live**

- Upload your `.apk` directly — no install needed
- Real Android devices in the cloud (Pixel 7, Samsung S23, etc.)
- Built-in screen recorder — ideal for capturing your hackathon demo video
- **Free trial:** 30 minutes of real device time
- Supports sideloading Phantom APK alongside your app for MWA testing

**Steps:**
1. Download the `.apk` from your EAS build: https://expo.dev/accounts/papajams.eth/projects/dallas-buyers-club/builds
2. Go to **browserstack.com → App Live → Upload APK**
3. Choose a **Pixel 7 (API 33+)** device
4. Sideload Phantom APK for wallet signing (optional — skip for UI-only demo)
5. Use the built-in screen recorder to capture your demo video

---

### Appetize.io — Best for Sharing with Judges
**https://appetize.io**

- Upload APK → get a shareable URL anyone can click to run your app in a browser
- **Free tier:** 100 minutes/month
- Embed the link in your pitch deck so judges can try it themselves
- **Limitation:** MWA wallet signing requires Phantom — use BrowserStack for the full flow

**Steps:**
1. Go to **appetize.io → Upload**
2. Upload your `.apk`
3. Share the generated URL in your hackathon submission

---

### Recommended Demo Recording Path

```
1. Download APK from EAS build URL
   ↓
2. Upload to BrowserStack App Live (free trial)
   ↓
3. Walk through: onboarding → alliances → submit wizard → ZK proof overlay
   ↓
4. Use BrowserStack's built-in screen recorder for demo video
   ↓
5. Upload to Appetize.io → share link with judges
```

---

## Option B: Android Studio Emulator (Full MWA Support)

Use this path if you need to test the complete Mobile Wallet Adapter signing flow with Phantom.

### 1. Install Android Studio

Download from https://developer.android.com/studio (free).

During setup, accept the default SDK components — you need:
- Android SDK (API 34 recommended)
- Android Emulator
- Android Virtual Device (AVD)

---

### 2. Create a Virtual Device (AVD)

1. Open Android Studio → **More Actions → Virtual Device Manager**
2. Click **Create Device**
3. Choose **Pixel 7** (good default) → Next
4. Select system image: **API 34 (Android 14)** → Download if needed → Next
5. Name it `DBC_Test` → Finish
6. Click ▶ to launch the emulator

The emulator boots in ~30 seconds. You'll see a standard Android home screen.

---

### 3. Install Phantom Wallet on the Emulator

The emulator has a built-in browser. Install Phantom via APK sideload:

```bash
# Download Phantom APK (get latest from https://phantom.app/download or APKPure)
# Then sideload it:
adb install phantom.apk
```

Or use the Google Play Store if you sign in with a Google account in the emulator.

> **Tip:** `adb` is in `~/Library/Android/sdk/platform-tools/adb` — add it to your PATH.

---

### 4. Run the App on the Emulator

```bash
# Make sure the emulator is running first, then:
cd mobile
pnpm exec expo run:android
```

This builds a debug APK, installs it on the running emulator, and opens it automatically.

> First build takes ~5 min (Gradle). Subsequent builds are ~30 seconds.

**Prerequisites:**
- `JAVA_HOME` must be set. Android Studio ships with a JDK:
  ```bash
  export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
  ```
- Add to your `~/.zshrc` or `~/.bashrc` to persist.

---

### 5. Test the Full Flow

Once the app is running on the emulator:

### Wallet Connect
1. Open the app → tap **Connect Wallet** on the Profile tab
2. The Mobile Wallet Adapter (MWA) intent fires → Phantom opens
3. Approve the connection

### Submit Optimization Log (Devnet)
1. Go to **Submit** tab
2. Complete the 4-step wizard
3. On step 4, tap **Sign & Submit**
4. Phantom opens for signing → approve
5. Watch the ZK proof overlay animate
6. Success screen shows tx signature + Explorer link
7. **8 seconds later** — a push notification fires: "✅ Optimization Log Validated"

### Push Notifications
- Notifications work on Android emulators (unlike iOS simulators)
- You'll see the permission dialog on first launch
- The daily challenge reminder is scheduled for 20 hours after first launch

---

### 6. Build a Release APK for Submission

Once testing is complete, build the hackathon APK via EAS:

```bash
cd mobile
npx eas login          # or set EXPO_TOKEN env var
npx eas build --platform android --profile preview
```

This produces a downloadable `.apk` at https://expo.dev/accounts/papajams.eth/projects/dallas-buyers-club/builds

---

### 7. Record the Demo Video

Use Android Studio's built-in screen recorder:
- Emulator toolbar → **Camera icon → Start Recording**
- Walk through: onboarding → alliances → tap card → join → submit wizard → ZK proof animation → success + tx hash → push notification arrives

Or use QuickTime on Mac with the emulator window captured.

**Key moments to capture for judges:**
1. MWA wallet connect flow
2. ZK proof overlay ("Forging Proof" animation)
3. Real tx signature with Explorer deep-link
4. Push notification arriving 8 seconds after submission
5. XP gained + rank progress on Profile tab

---

### Troubleshooting

| Issue | Fix |
|---|---|
| `adb: command not found` | `export PATH=$PATH:~/Library/Android/sdk/platform-tools` |
| `JAVA_HOME not set` | `export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"` |
| Emulator won't start | Ensure Hardware Acceleration (HAXM/HVF) is enabled in BIOS |
| MWA intent not resolving | Phantom must be installed on the emulator before testing MWA |
| Build fails with Gradle error | Run `cd mobile/android && ./gradlew clean` then retry |
| Metro bundler not found | Run `pnpm install` in `mobile/` first |
