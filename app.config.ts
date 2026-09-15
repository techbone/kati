import type { ExpoConfig } from 'expo/config';

/**
 * Track C owns this file. Anyone else changing it must say so in standup —
 * a plugin change invalidates everyone's development build.
 */
const config: ExpoConfig = {
  name: 'Kati',
  slug: 'kati',
  owner: 'abdullahabubakar461',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'kati',
  userInterfaceStyle: 'automatic',
  icon: './assets/images/icon.png',

  ios: {
    // Light/dark app icon variants. Regenerate from assets/brand/build-icons.js.
    icon: {
      light: './assets/images/icon.png',
      dark: './assets/images/icon-dark.png',
    },
    // Must match the App Store Connect record exactly. Change only before the first build.
    bundleIdentifier: 'com.kati.app',
    // Judges download from the US — never geo-restrict the listing.
    supportsTablet: false,
    buildNumber: '1',
    config: {
      // Declares no non-exempt encryption, which skips the export-compliance
      // question on every single submission. Saves minutes per upload.
      usesNonExemptEncryption: false,
    },
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },

  android: {
    package: 'com.kati.app',
    adaptiveIcon: {
      backgroundColor: '#1F5F4A',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },

  plugins: [
    'expo-router',
    'expo-sqlite',
    'expo-localization',
    'expo-sharing',
    '@react-native-community/datetimepicker',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#1F5F4A',
        image: './assets/images/splash-icon.png',
        imageWidth: 150,
        dark: {
          backgroundColor: '#131311',
          image: './assets/images/splash-icon.png',
        },
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/images/notification-icon.png',
        color: '#1F5F4A',
      },
    ],
  ],

  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },

  extra: {
    eas: {
      projectId: '10f269f9-16cc-42f1-8501-83f4d08d0ed3',
    },
    // Public SDK key (safe in the client). Test Store key for sandbox / Shipaton
    // judging. Swap to the iOS App Store key for production/TestFlight builds —
    // never ship a Test Store key to App Review.
    revenueCatApiKey: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY ?? 'test_vfzxLgSZyofMOuXpbYqJRzkTkij',
  },
};

export default config;
