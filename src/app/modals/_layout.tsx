import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/useTheme';

export default function ModalsLayout() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'modal',
        contentStyle: { backgroundColor: theme.colors.bg },
      }}
    />
  );
}
