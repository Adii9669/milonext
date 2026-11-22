# Onechat Android APK Build & Native Architecture Guide

This guide describes how to build, test, and release the installable Android APK for **Onechat** with background audio playback support via Capacitor.

---

## 1. Prerequisites

- **Node.js**: v20+ (v26 installed in this repository)
- **Package Manager**: `pnpm` or `npm`
- **Java Development Kit (JDK)**: OpenJDK 17 or 21 (`JAVA_HOME` configured)
- **Android SDK**: Android API 34+ (compileSdkVersion: 34 or higher)
- **Build Tools**: Gradle 8.0+ (bundled as `./gradlew` inside `/android`)

---

## 2. Native Architecture Overview

### 2.1 Background Playback via Foreground Service
Standard Android WebViews automatically sleep and halt JavaScript execution when the device screen turns off or the application is sent to the background.
To ensure radio audio streams **never stop playing**:
- **[NativeRadioPlugin.java](file:///home/adii/Projects/miloverse/frontend/android/app/src/main/java/com/onechat/app/NativeRadioPlugin.java)**: Capacitor plugin bridging the web app's `AudioEngine` to native Android.
- **[MediaPlaybackService.java](file:///home/adii/Projects/miloverse/frontend/android/app/src/main/java/com/onechat/app/MediaPlaybackService.java)**: Native Android `Service` running in the foreground with:
  - `PARTIAL_WAKE_LOCK` keeping stream sockets alive with the screen off.
  - Ongoing `NotificationCompat` media notification on the lock screen with Play, Pause, and Stop buttons.
  - `AudioManager.OnAudioFocusChangeListener` handling audio ducking during incoming alerts and automatic pause on incoming phone calls.

### 2.2 Cleartext Audio Streaming
Many public international radio streams broadcast over standard `http://`.
Android strictly blocks cleartext traffic by default unless explicitly configured.
We provide **[network_security_config.xml](file:///home/adii/Projects/miloverse/frontend/android/app/src/main/res/xml/network_security_config.xml)** which allows cleartext streaming for audio feeds while preserving HTTPS encryption for API and auth endpoints.

---

## 3. Configuration & Server Setup

### 3.1 Pointing to a Hosted Backend
In **[capacitor.config.ts](file:///home/adii/Projects/miloverse/frontend/capacitor.config.ts)**:
```typescript
const config: CapacitorConfig = {
  appId: 'com.onechat.app',
  appName: 'Onechat',
  webDir: 'public',
  server: {
    androidScheme: 'https',
    cleartext: true,
    // For live backend/production:
    // url: 'https://milocore.onrender.com',
  },
  // ...
};
```

---

## 4. Build Commands & Scripts

The following npm scripts are available in `package.json`:

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm run android:sync` | `cap sync android` | Copies web assets to Android assets folder and updates plugins. |
| `npm run android:open` | `cap open android` | Opens the native Android project in Android Studio. |
| `npm run android:apk:debug` | `cd android && ./gradlew assembleDebug` | Compiles an installable debug APK. |
| `npm run android:apk:release` | `cd android && ./gradlew assembleRelease` | Compiles an optimized release APK. |

---

## 5. Step-by-Step Build Instructions

### Step 1: Sync Assets
```bash
npm run build
npm run android:sync
```

### Step 2: Build Debug APK
```bash
npm run android:apk:debug
```
Output location:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Step 3: Install onto Device via ADB
```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 6. Release Build & Keystore Signing

To generate a production release APK for distribution:

### 1. Generate a Keystore
```bash
keytool -genkey -v -keystore onechat-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias onechat
```

### 2. Configure Gradle Signing
In `android/app/build.gradle`:
```groovy
android {
    signingConfigs {
        release {
            storeFile file(System.getenv("KEYSTORE_PATH") ?: "onechat-release-key.jks")
            storePassword System.getenv("KEYSTORE_PASSWORD")
            keyAlias System.getenv("KEY_ALIAS") ?: "onechat"
            keyPassword System.getenv("KEY_PASSWORD")
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 3. Build the Release APK
```bash
npm run android:apk:release
```
Output location:
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 7. Testing Checklist

1. **Background Audio**: Start a Jam radio station. Turn off the phone screen. Verify audio continues streaming indefinitely.
2. **Lock Screen Controls**: Pull down notification drawer or inspect lock screen. Tap Pause/Play/Stop to verify system controls.
3. **Audio Focus**: Trigger an incoming phone call or play audio in another app; verify Onechat Jam pauses gracefully and restores upon completion.
4. **Composer Keyboard Resize**: Open a chat room and focus on the message composer. Ensure the soft keyboard resizes the viewport (`windowSoftInputMode="adjustResize"`) without covering input buttons.
