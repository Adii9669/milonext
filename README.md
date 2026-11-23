# Onechat — Real-Time Chat, Audio Jam & Cross-Platform Experience

[![Android APK Release](https://img.shields.io/badge/Android-APK%20Release-brightgreen?logo=android)](https://github.com/Adii9669/milonext/releases)
[![Next.js 16](https://img.shields.io/badge/Next.js-16%20(App%20Router)-black?logo=next.js)](https://nextjs.org/)
[![Capacitor 8](https://img.shields.io/badge/Capacitor-8.0-blue?logo=capacitor)](https://capacitorjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%20v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![pnpm](https://img.shields.io/badge/pnpm-9.x-orange?logo=pnpm)](https://pnpm.io/)

**Onechat** is a high-performance, real-time messaging and collaborative audio platform engineered with Next.js, WebSockets, and Capacitor. It bridges editorial desktop design with a mobile-first native Android experience, featuring synchronized **Jam** live music streaming, interactive voice notes with waveform rendering, and end-to-end conversation management.

---

## Highlights & Core Features

### 1. Real-Time Chat & Intimacy
- **WebSockets Infrastructure**: Instant message dispatch, live typing indicators, delivered/read receipts, and optimistic UI updates.
- **Interactive Voice Notes**: In-browser audio recording with live waveform visualization, multi-speed playback, and scrubbing.
- **Rich Media & Attachments**: File sharing, image previews, message actions, and search.

### 2. Live Audio Jam Rooms
- **Synchronized Playback**: Collaborative music streaming powered by Web Audio API and HLS streaming.
- **Background Playback on Android**: Native `FOREGROUND_SERVICE_MEDIA_PLAYBACK` support ensures audio keeps playing even when the phone screen is locked or the app is minimized.

### 3. Cross-Platform Responsive Design
- **Desktop (`/connect`)**: Sleek 3-pane layout (`Sidebar` $\rightarrow$ `Chat Canvas` $\rightarrow$ `Details Panel`) styled in custom Iris Purple (`#6E53CC` / `#A78BFA`) and deep obsidian tones.
- **Mobile Web & Android APK**: Mobile-first full-screen views with top-left stack navigation, drawer sidebars, and native gesture handling.
- **Creative Showcase (`/home`)**: An award-winning editorial showcase featuring Lenis smooth scrolling, GSAP micro-interactions, and creative engineering highlights.

### 4. Robust Authentication
- **Fast 1-Tap Demo**: Pre-configured guest demo button (`adii` / `password123`) for instant testing without manual typing.
- **Secure Sessions**: JWT tokens with automatic refresh token rotation, email OTP verification, and loop-proof session recovery guards.

---

## Route Overview

| Route | Destination | Description |
|---|---|---|
| `/` | **Landing / Auth Experience** | Root entry point. Direct access to Sign-in & Sign-up cards (auto-redirects to `/connect` if authenticated). |
| `/home` | **Desktop Portfolio** | Creative engineering landing page with Lenis smooth scrolling and showcase components. |
| `/connect` | **Onechat Workspace** | Main real-time application (DMs, group channels, and collaborative Jam rooms). |
| `/login` | **Login View** | Direct link to authentication login card. |
| `/signup` | **Registration View** | Direct link to account creation and email OTP confirmation. |

---

## Quick Test Credentials

To test the application immediately without registration:

- **Username**: `adii`
- **Password**: `password123`

*(You can also click the **"Fill Demo"** button on the login screen to populate these credentials with 1 tap).*

---

## Getting Started

### Prerequisites
- **Node.js**: v20 or higher
- **pnpm**: v9 or higher (`npm install -g pnpm`)
- **Android Studio** *(optional, only needed for local Android native development)*

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Adii9669/milonext.git
cd milonext
pnpm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_WS_URL=ws://localhost:5000
```

### 3. Start the Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The server automatically binds to `0.0.0.0` so mobile devices on your local network can connect directly.

---

## Android Mobile App & APK Guide

Onechat packages natively for Android using **Capacitor**.

### Downloading the APK
Pre-built signed Android APKs are available directly on the **[GitHub Releases Page](https://github.com/Adii9669/milonext/releases)**.
1. Open [GitHub Releases](https://github.com/Adii9669/milonext/releases) on your Android device.
2. Under **Assets**, tap **`Onechat-v1.0.x.apk`** to download and install.

---

### Building the APK Locally
If you want to build the Android APK on your machine:

```bash
# 1. Sync web assets with Capacitor
pnpm android:sync

# 2. Build Debug APK
pnpm android:apk:debug

# 3. Output location:
# android/app/build/outputs/apk/debug/app-debug.apk
```

To open the project inside Android Studio:
```bash
pnpm android:open
```

---

## Automated CI/CD (GitHub Actions)

This repository includes two automated workflows:

1. **`build-apk.yml`**: Automatically verifies builds and generates test debug APKs on every push to `main` and `dev`.
2. **`release-apk.yml`**: Builds and publishes a new **GitHub Release** with the standalone `.apk` attached as a downloadable asset whenever a version tag (e.g. `v1.0.1`) is pushed or manually triggered.

### Publishing a New Release:
```bash
git tag v1.0.1
git push origin v1.0.1
```
*GitHub Actions will automatically build `Onechat-v1.0.1.apk` and attach it to the release page within ~3 minutes.*

---

## Tech Stack

| Domain | Technology |
|---|---|
| **Frontend Framework** | [Next.js 16](https://nextjs.org/) (React 19, App Router) |
| **Mobile Runtime** | [Capacitor 8](https://capacitorjs.com/) (Android SDK 34+) |
| **Styling & Motion** | [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion), [GSAP](https://gsap.com/) |
| **Audio & Media** | Web Audio API, HLS.js, Custom AudioEngine |
| **Smooth Scrolling** | [Lenis](https://lenis.darkroom.engineering/) |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand), [TanStack React Query](https://tanstack.com/query) |
| **Forms & Validation** | React Hook Form, Zod |
| **Package Manager** | [pnpm](https://pnpm.io/) |

---

## License & Credits

Built with precision by **Aditya Raj Singh** · Onechat. Always Building.
