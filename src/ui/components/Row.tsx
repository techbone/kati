import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { Icon } from '@/ui/components/Icon';
import { Text } from '@/ui/components/Text';

interface RowProps {
  label: string;
  /** Secondary line under the label. */
  detail?: string;
  /** Right-hand content: a value string, or a control such as a Switch. */
  value?: string;
  right?: ReactNode;
  icon?: string;
  onPress?: () => void;
  /** Draws the divider under this row. Off for the last row in a group. */
  divider?: boolean;
  destructive?: boolean;
}

/** A settings-style list row. Group several inside a Card with padded={false}. */
export function Row({
  label,
  detail,
  value,
  right,
  icon,
  onPress,
  divider = true,
  destructive = false,
}: RowProps) {
  const theme = useTheme();
  const labelColor = destructive ? 'overdue' : 'ink';

  const body = (
    <View
      style={[
        styles.row,
        {
          gap: theme.space.md,
          paddingHorizontal: theme.space.lg,
          paddingVertical: theme.space.md,
          borderBottomWidth: divider ? StyleSheet.hairlineWidth : 0,
          borderBottomColor: theme.colors.line,
        },
      ]}
    >
      {icon ? <Icon name={icon} size={18} color={destructive ? 'overdue' : 'primary'} /> : null}
      <View style={[styles.text, { gap: 1 }]}>
        <Text variant="body" color={labelColor}>
          {label}
        </Text>
        {detail ? (
          <Text variant="caption" color="inkMuted">
            {detail}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text variant="body" color="inkMuted">
          {value}
        </Text>
      ) : null}
      {right}
      {onPress && !right ? <Icon name="chevron.right" size={12} color="inkSoft" /> : null}
    </View>
  );

  if (!onPress) return body;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}, ${value}` : label}
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 48 },
  text: { flex: 1 },
  pressed: { opacity: 0.7 },
});
