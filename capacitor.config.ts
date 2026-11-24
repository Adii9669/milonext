import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.onechat.app',
  appName: 'Onechat',
  webDir: 'public',
  server: {
    androidScheme: 'https',
    cleartext: true,
    url: process.env.CAPACITOR_SERVER_URL || 'https://milonext.vercel.app',
  },
  plugins: {
    SplashScreen: {
      // Kept as a failsafe: the web app calls SplashScreen.hide() as soon as
      // it is ready, this timeout only covers a hung/failed page load.
      launchShowDuration: 10000,
      launchAutoHide: true,
      launchFadeOutDuration: 250,
      backgroundColor: '#09090B',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      layoutName: 'oc_splash_layout',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK' as any,
      backgroundColor: '#09090B',
    },
  },
};

export default config;
