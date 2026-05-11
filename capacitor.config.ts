import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vidiocv.app',
  appName: 'VidioCV',
  webDir: 'out',
  server: {
    // Point this to your production URL for store builds
    // or your local IP (e.g., http://192.168.1.XX:3000) for local testing
    url: 'https://vidio-cv.com',
    cleartext: true
  }
};

export default config;
