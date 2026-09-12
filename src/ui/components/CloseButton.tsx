import { Pressable, StyleSheet } from 'react-native';

import { useFontScale } from '@/hooks/useFontScale';
import { useTheme } from '@/hooks/useTheme';
import { Icon } from '@/ui/components/Icon';

interface CloseButtonProps {
  onPress: () => void;
  label?: string;
}

/** Dismiss control for sheets. Hit target is always ≥44pt via hitSlop. */
export function CloseButton({ onPress, label = 'Close' }: CloseButtonProps) {
  const theme = useTheme();
  const size = 32 * useFontScale(1.3);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={12}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.colors.surfaceMuted,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Icon name="xmark" size={14} color="inkMuted" weight="bold" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
});
