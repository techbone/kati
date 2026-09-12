import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import type { ColorValue } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

function TabIcon({ name, color, size }: { name: string; color: ColorValue; size: number }) {
  return <SymbolView name={name as never} tintColor={color} size={size} weight="medium" />;
}

function tabIcon(name: string) {
  const render = (props: { color: ColorValue; size: number }) => <TabIcon name={name} {...props} />;
  render.displayName = `TabIcon(${name})`;
  return render;
}

export default function TabsLayout() {
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.inkSoft,
        tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.line },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        sceneStyle: { backgroundColor: theme.colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Schedule', tabBarIcon: tabIcon('calendar') }} />
      <Tabs.Screen name="card" options={{ title: 'Card', tabBarIcon: tabIcon('doc.text.fill') }} />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Settings', tabBarIcon: tabIcon('gearshape.fill') }}
      />
    </Tabs>
  );
}
