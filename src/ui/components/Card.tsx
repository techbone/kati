import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

interface CardProps extends PropsWithChildren {
  onPress?: () => void;
  /** Muted variant for secondary information. */
  muted?: boolean;
  /** Left edge stripe colour — used to encode status on visit cards. */
  stripe?: string;
  padded?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

/**
 * A surface. Cards are the one place we spend border + radius, so the
 * hierarchy on a screen stays readable — don't nest them.
 */
export function Card({
  children,
  onPress,
  muted = false,
  stripe,
  padded = true,
  style,
  accessibilityLabel,
}: CardProps) {
  const theme = useTheme();

  const surface: ViewStyle = {
    backgroundColor: muted ? theme.colors.surfaceMuted : theme.colors.surface,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.lg,
    padding: padded ? theme.space.lg : 0,
    borderLeftWidth: stripe ? 4 : StyleSheet.hairlineWidth,
    borderLeftColor: stripe ?? theme.colors.line,
  };

  if (!onPress) {
    return <View style={[styles.base, surface, style]}>{children}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.base, surface, pressed && styles.pressed, style]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  pressed: { opacity: 0.85 },
});
