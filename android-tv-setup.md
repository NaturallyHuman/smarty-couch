# Android TV App Setup Guide

Your Smarty Couch trivia game is now configured as a native Android TV app!

## Prerequisites

Before you begin, make sure you have:
- **Android Studio** installed on your computer
- A **Chromecast with Google TV** or Android TV device
- Basic command line familiarity

## Setup Steps

### 1. Export to GitHub
1. Click the **"Export to GitHub"** button in Lovable
2. Clone the repository to your local machine:
```bash
git clone [your-repo-url]
cd [your-project-name]
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Add Android Platform
```bash
npx cap add android
```

This creates the `android/` folder with your native Android TV project.

### 4. Build Your Web App
```bash
npm run build
```

### 5. Sync to Android
```bash
npx cap sync android
```

This copies your web app into the Android project.

### 6. Open in Android Studio
```bash
npx cap open android
```

Or manually open the `android/` folder in Android Studio.

### 7. Uploaded Android TV Icon and Banner

The uploaded Smarty Couch artwork is now prepared as native resources:
- Legacy launcher PNGs at mdpi, hdpi, xhdpi, xxhdpi and xxxhdpi sizes.
- An adaptive launcher icon for Android 8+ with the complete artwork inside its safe area.
- A 320×180 Android TV banner using the same artwork (not the square launcher icon).

After updating your local checkout from the connected repository, run from the project root:
```bash
npm install
npm run build
npx cap sync android
```

The sync hook automatically downloads the committed artwork pointers into actual Android PNG resources and updates your existing `android/app/src/main/AndroidManifest.xml`. It does not replace your Android project, alter your package ID, or change your working Java 17/Gradle configuration. Internet access is required for this resource installation; installed artwork is bundled in the APK and does not need internet to display.

If Android does not exist locally yet, run `npx cap add android` before syncing. Do not delete or recreate an existing Android project.

The manifest receives `android:icon` and `android:roundIcon` pointing to `@mipmap/smarty_couch_launcher`, plus `android:banner` pointing to `@drawable/smarty_couch_tv_banner`. MainActivity includes both phone `LAUNCHER` and TV `LEANBACK_LAUNCHER` categories; Leanback and touchscreen features are optional to retain phone compatibility. Existing permissions, themes, providers and activity settings are preserved. The first changed manifest is backed up alongside it as `AndroidManifest.xml.smarty-couch-backup`.

For an existing Android project, you can also apply only the branding with:
```bash
npm run android:branding
```

Rebuild and reinstall the APK to see the native icon. Publishing the website alone does not update an installed APK. Some TV launchers cache artwork; restart the launcher/TV if the old icon remains after installing the new APK. Native compilation and physical-TV display still require local verification.

### 8. Run on Your Android TV Device

#### Option A: Using an Emulator
1. In Android Studio, go to **Tools → Device Manager**
2. Create a new **Android TV** virtual device
3. Click the **Run** button (green play icon)

#### Option B: Using Your Physical Chromecast/Android TV
1. Enable **Developer Mode** on your TV:
   - Go to Settings → About
   - Click on "Build" 7 times until it says "You are now a developer"
2. Enable **USB Debugging** in Settings → Developer Options
3. Connect via ADB:
   ```bash
   adb connect [YOUR_TV_IP_ADDRESS]:5555
   ```
4. Click **Run** in Android Studio and select your TV device

## Testing the D-pad

Your game's arrow key controls will automatically map to the TV remote:
- **Up/Down/Left/Right** D-pad → Navigate answers
- **Center/Select** button → Confirm selection
- **Back** button → Pause menu

## Building for Distribution

When ready to share your app:

### Create a Release APK:
```bash
cd android
./gradlew assembleRelease
```

The APK will be in: `android/app/build/outputs/apk/release/`

### Sideload to other devices:
```bash
adb install app-release.apk
```

## Hot Reload During Development

While developing, your app connects to the Lovable preview URL, so changes you make in Lovable appear instantly on the TV! After making changes:
```bash
npx cap sync android
```

## Troubleshooting

**Issue: Can't connect to device**
- Make sure your computer and TV are on the same WiFi network
- Try `adb devices` to see if your device is listed

**Issue: App crashes on launch**
- Check the Logcat in Android Studio for errors
- Make sure you ran `npm run build` before `npx cap sync`

**Issue: Remote buttons not working**
- The app should automatically handle D-pad input
- Make sure you're using the TV remote, not a phone remote app

## Next Steps

- Test all game features on your TV
- Rebuild and reinstall the APK after changing native launcher artwork
- Consider publishing to Google Play Store once ready

Happy gaming on the big screen! 🎮📺

For more background, read the [Lovable native mobile development guide](https://lovable.dev/blog/capacitor-mobile-apps).
