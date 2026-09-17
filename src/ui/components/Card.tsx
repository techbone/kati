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
    paddingLeft: (padded ? theme.space.lg : 0) + (stripe ? STRIPE : 0),
  };

  // A thick left border on a rounded view curves around the corners and
  // tapers into the hairline edges. An inner bar clipped by the card's own
  // radius stays a clean, flat stripe top to bottom.
  const bar = stripe ? (
    <View pointerEvents="none" style={[styles.stripe, { backgroundColor: stripe }]} />
  ) : null;

  if (!onPress) {
    return (
      <View style={[styles.base, surface, style]}>
        {bar}
        {children}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.base, surface, pressed && styles.pressed, style]}
    >
      {bar}
      {children}
    </Pressable>
  );
}

const STRIPE = 4;

const styles = StyleSheet.create({
  base: { borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  stripe: { position: 'absolute', left: 0, top: 0, bottom: 0, width: STRIPE },
  pressed: { opacity: 0.85 },
});
