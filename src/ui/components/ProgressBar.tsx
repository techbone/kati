import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

interface ProgressBarProps {
  /** 0..1 */
  value: number;
  accessibilityLabel: string;
}

export function ProgressBar({ value, accessibilityLabel }: ProgressBarProps) {
  const theme = useTheme();
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}
      style={[styles.track, { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.pill }]}
    >
      <View
        style={[
          styles.fill,
          { width: `${pct}%`, backgroundColor: theme.colors.given, borderRadius: theme.radius.pill },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 6, overflow: 'hidden' },
  fill: { height: '100%' },
});
