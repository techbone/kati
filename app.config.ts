import type { ExpoConfig } from 'expo/config';

/**
 * Track C owns this file. Anyone else changing it must say so in standup —
 * a plugin change invalidates everyone's development build.
 */
const config: ExpoConfig = {
  name: 'Kati',
  slug: 'kati',
  owner: 'abdullahabubakar461',
  version: '1.0.1',
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
    // Must match the Play Console application id. Change only before the first upload.
    package: 'com.kati.app',
    // Play requires a monotonic integer; EAS production autoIncrement bumps it on each build.
    versionCode: 1,
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

  updates: {
    url: 'https://u.expo.dev/10f269f9-16cc-42f1-8501-83f4d08d0ed3',
  },
  runtimeVersion: {
    policy: 'appVersion',
  },

  extra: {
    eas: {
      projectId: '10f269f9-16cc-42f1-8501-83f4d08d0ed3',
    },
    // Public SDK keys (safe in the client). Use platform-specific store keys in
    // production: appl_… (iOS) and goog_… (Android). Fallbacks are RevenueCat
    // Test Store for local/dev only — never ship test_… to App Review or Play.
    revenueCatApiKeyIos:
      process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS ?? 'test_vfzxLgSZyofMOuXpbYqJRzkTkij',
    revenueCatApiKeyAndroid:
      process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID ?? 'test_vfzxLgSZyofMOuXpbYqJRzkTkij',
  },
};

export default config;
