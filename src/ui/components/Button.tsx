import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { Icon } from '@/ui/components/Icon';
import { Text } from '@/ui/components/Text';
import { hitSize } from '@/ui/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  /** Stretch to the container width. */
  block?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  block = false,
  style,
}: ButtonProps) {
  const theme = useTheme();
  const c = theme.colors;

  const palette = {
    primary: { bg: c.primary, fg: 'onPrimary' as const, border: c.primary },
    secondary: { bg: c.primarySoft, fg: 'primary' as const, border: c.primarySoft },
    ghost: { bg: 'transparent', fg: 'primary' as const, border: 'transparent' },
    danger: { bg: c.overdueSoft, fg: 'overdue' as const, border: c.overdueSoft },
  }[variant];

  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      accessibilityLabel={label}
      disabled={inactive}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          borderRadius: theme.radius.lg,
          paddingHorizontal: theme.space.xl,
          opacity: inactive ? 0.5 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
        block && styles.block,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={c[palette.fg]} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={18} color={palette.fg} weight="semibold" /> : null}
          <Text variant="bodyStrong" color={palette.fg}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: hitSize + 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  block: { alignSelf: 'stretch' },
});
