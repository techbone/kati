import { StyleSheet, View } from 'react-native';

import { useFontScale } from '@/hooks/useFontScale';
import { useTheme } from '@/hooks/useTheme';
import { Icon } from '@/ui/components/Icon';
import type { Palette } from '@/ui/theme';

interface IconBadgeProps {
  name: string;
  /** Box size at 1x. Icon is half of it. Both scale with Dynamic Type. */
  size?: number;
  color?: keyof Palette;
  background?: keyof Palette;
  round?: boolean;
}

/** An icon in a soft tile — feature lists, empty states, sheet headers. */
export function IconBadge({
  name,
  size = 40,
  color = 'primary',
  background = 'primarySoft',
  round = false,
}: IconBadgeProps) {
  const theme = useTheme();
  const k = useFontScale(1.3);
  const box = size * k;
  return (
    <View
      style={[
        styles.box,
        {
          width: box,
          height: box,
          backgroundColor: theme.colors[background],
          borderRadius: round ? box / 2 : theme.radius.md,
        },
      ]}
    >
      <Icon name={name} size={size / 2} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center' },
});
