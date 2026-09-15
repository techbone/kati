import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';

interface ProgressBarProps {
  /** 0..1 */
  value: number;
  accessibilityLabel: string;
}

/**
 * Animates toward its value rather than jumping, so marking a dose given
 * reads as progress being made — the one moment of reward in the app.
 */
export function ProgressBar({ value, accessibilityLabel }: ProgressBarProps) {
  const theme = useTheme();
  const pct = Math.max(0, Math.min(1, value)) * 100;
  const width = useSharedValue(pct);

  useEffect(() => {
    width.value = withTiming(pct, { duration: 500, easing: Easing.out(Easing.cubic) });
  }, [pct, width]);

  const fill = useAnimatedStyle(() => ({ width: `${width.value}%` }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}
      style={[
        styles.track,
        { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.pill },
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          fill,
          { backgroundColor: theme.colors.given, borderRadius: theme.radius.pill },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 6, overflow: 'hidden' },
  fill: { height: '100%' },
});
