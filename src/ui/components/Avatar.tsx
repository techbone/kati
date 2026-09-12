import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/ui/components/Text';

interface AvatarProps {
  name: string;
  size?: number;
}

/**
 * Initials on a colour derived from the name. Deterministic, so a child keeps
 * the same colour everywhere in the app without storing anything.
 */
const HUES = [152, 200, 28, 262, 340, 92];

function hueFor(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return HUES[h % HUES.length] ?? HUES[0]!;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase() || '?';
}

export function Avatar({ name, size = 40 }: AvatarProps) {
  const theme = useTheme();
  const hue = hueFor(name);
  const dark = theme.scheme === 'dark';
  const bg = `hsl(${hue}, ${dark ? 30 : 45}%, ${dark ? 26 : 88}%)`;
  const fg = `hsl(${hue}, ${dark ? 45 : 50}%, ${dark ? 78 : 28}%)`;

  return (
    <View
      accessibilityLabel={name}
      style={[styles.base, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}
    >
      <Text
        variant={size >= 56 ? 'title' : 'bodyStrong'}
        style={{ color: fg, fontSize: size * 0.4, lineHeight: size * 0.5 }}
      >
        {initials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
});
