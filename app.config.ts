import type { ExpoConfig } from 'expo/config';

/**
 * Track C owns this file. Anyone else changing it must say so in standup —
 * a plugin change invalidates everyone's development build.
 */

/** Store builds must not bake in RevenueCat Test Store keys (Error 23 / empty offerings). */
function revenueCatKey(
  envNames: string[],
  platform: 'ios' | 'android',
  devFallback: string,
): string {
  const fromEnv = envNames.map((n) => process.env[n]?.trim()).find((v) => Boolean(v));
  const profile = process.env.EAS_BUILD_PROFILE;
  const storeBuild = profile === 'production' || profile === 'preview';
  const prefix = platform === 'ios' ? 'appl_' : 'goog_';
  const hint = envNames.join(' or ');

  if (storeBuild) {
    if (!fromEnv) {
      throw new Error(
        `Missing ${hint} for EAS profile "${profile}". Set it in Expo → Project → Environment variables to a ${prefix}… public SDK key.`,
      );
    }
    if (fromEnv.startsWith('test_')) {
      throw new Error(
        `RevenueCat key for ${platform} is a Test Store key (test_…). ${profile} builds need a ${prefix}… key or App Store / Play offerings stay empty (RC Error 23).`,
      );
    }
    if (platform === 'ios' && fromEnv.startsWith('goog_')) {
      throw new Error(`iOS builds need an appl_… key, not goog_…. Check ${hint}.`);
    }
    if (platform === 'android' && fromEnv.startsWith('appl_')) {
      throw new Error(
        `Android builds need a goog_… key, not appl_…. Add EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID (do not reuse the iOS key).`,
      );
    }
    return fromEnv;
  }

  return fromEnv || devFallback;
}

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
    // Public SDK keys (safe in the client). Production/preview EAS builds require
    // appl_… / goog_… via Expo project env — a silent test_… fallback causes RC
    // Error 23 (empty offerings) on real stores. Local/dev may use Test Store.
    // iOS also accepts legacy EXPO_PUBLIC_REVENUECAT_API_KEY (already set on EAS).
    revenueCatApiKeyIos: revenueCatKey(
      ['EXPO_PUBLIC_REVENUECAT_API_KEY_IOS', 'EXPO_PUBLIC_REVENUECAT_API_KEY'],
      'ios',
      'test_vfzxLgSZyofMOuXpbYqJRzkTkij',
    ),
    revenueCatApiKeyAndroid: revenueCatKey(
      ['EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID'],
      'android',
      'test_vfzxLgSZyofMOuXpbYqJRzkTkij',
    ),
  },
};

export default config;
