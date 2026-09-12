import { useColorScheme } from 'react-native';

import { darkTheme, lightTheme, type Theme } from '@/ui/theme';

/** Resolves the active theme from the system appearance. */
export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? darkTheme : lightTheme;
}
