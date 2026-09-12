import { Fraunces_400Regular, Fraunces_600SemiBold, useFonts } from '@expo-google-fonts/fraunces';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { useAppStore } from '@/hooks/useStore';
import { useTheme } from '@/hooks/useTheme';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ fade: true, duration: 300 });

/**
 * Native iOS bottom sheet. Must be a direct child of this Stack — form sheets
 * can't host a nested navigator or a native header, so sheet screens render
 * their own title row.
 */
function sheet(detents: number[]) {
  return {
    presentation: 'formSheet' as const,
    sheetAllowedDetents: detents,
    sheetInitialDetentIndex: 0,
    sheetGrabberVisible: true,
    sheetCornerRadius: 24,
  };
}

export default function RootLayout() {
  const theme = useTheme();
  const hydrated = useAppStore((s) => s.hydrated);
  const hydrate = useAppStore((s) => s.hydrate);
  const [fontsLoaded] = useFonts({ Fraunces_400Regular, Fraunces_600SemiBold });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const ready = hydrated && fontsLoaded;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  const navTheme = theme.scheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider
      value={{
        ...navTheme,
        colors: {
          ...navTheme.colors,
          background: theme.colors.bg,
          card: theme.colors.surface,
          text: theme.colors.ink,
          border: theme.colors.line,
          primary: theme.colors.primary,
        },
      }}
    >
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.bg } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="children" options={sheet([0.55, 1])} />
        <Stack.Screen name="dose" options={sheet([0.8, 1])} />
        <Stack.Screen name="paywall" options={sheet([0.85, 1])} />
      </Stack>
    </ThemeProvider>
  );
}
