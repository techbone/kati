import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import type { ScheduleItem } from '@/contracts';
import { useMotion } from '@/hooks/useMotion';
import { useTheme } from '@/hooks/useTheme';
import { Icon } from '@/ui/components/Icon';
import { Text } from '@/ui/components/Text';
import { formatDate } from '@/ui/format';

interface DoseRowProps {
  item: ScheduleItem;
  onPress?: (item: ScheduleItem) => void;
  last?: boolean;
}

/** One dose inside a visit card. Tap → dose detail (M2). */
export function DoseRow({ item, onPress, last = false }: DoseRowProps) {
  const theme = useTheme();
  const { motion } = useMotion();
  const { dose, status, record } = item;
  const done = status === 'given' || status === 'skipped';

  const icon =
    status === 'given' ? 'checkmark.circle.fill' : status === 'skipped' ? 'minus.circle' : 'circle';
  const iconColor = status === 'given' ? 'given' : status === 'skipped' ? 'skipped' : 'inkSoft';

  const trailing =
    status === 'given' && record?.givenDate
      ? formatDate(record.givenDate)
      : status === 'skipped'
        ? 'Skipped'
        : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${dose.vaccineName}, ${dose.doseLabel}, ${status}`}
      onPress={onPress ? () => onPress(item) : undefined}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        {
          gap: theme.space.md,
          paddingVertical: theme.space.md,
          paddingHorizontal: theme.space.lg,
          borderBottomColor: theme.colors.line,
          borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      {/* keyed on status so a change re-mounts the icon and plays the entrance */}
      <Animated.View
        key={status}
        entering={status === 'given' ? motion(ZoomIn.springify().damping(14)) : undefined}
      >
        <Icon
          name={icon}
          size={20}
          color={iconColor}
          weight={status === 'given' ? 'semibold' : 'regular'}
        />
      </Animated.View>
      <View style={styles.text}>
        <Text variant="body" color={done ? 'inkMuted' : 'ink'}>
          {dose.shortName}
          <Text variant="body" color="inkSoft">
            {'  '}
            {dose.doseLabel}
          </Text>
        </Text>
      </View>
      {trailing ? (
        <Text variant="caption" color="inkSoft">
          {trailing}
        </Text>
      ) : null}
      {onPress ? <Icon name="chevron.right" size={12} color="inkSoft" /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  text: { flex: 1 },
});
