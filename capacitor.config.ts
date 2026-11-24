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
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#09090B',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK' as any,
      backgroundColor: '#09090B',
    },
  },
};

export default config;
