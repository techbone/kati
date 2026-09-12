import { StyleSheet, View } from 'react-native';

import type { ScheduleItemStatus } from '@/contracts';
import { useTheme } from '@/hooks/useTheme';
import { Icon } from '@/ui/components/Icon';
import { Text } from '@/ui/components/Text';

interface PillProps {
  status: ScheduleItemStatus;
  /** Override the default label, e.g. "3 days overdue". */
  label?: string;
  compact?: boolean;
}

export const STATUS_LABEL: Record<ScheduleItemStatus, string> = {
  given: 'Given',
  due: 'Due now',
  overdue: 'Overdue',
  upcoming: 'Upcoming',
  skipped: 'Skipped',
};

export const STATUS_ICON: Record<ScheduleItemStatus, string> = {
  given: 'checkmark.circle.fill',
  due: 'clock.fill',
  overdue: 'exclamationmark.circle.fill',
  upcoming: 'calendar',
  skipped: 'minus.circle.fill',
};

/**
 * The status badge. Colour carries the meaning; the icon and label confirm it,
 * so it still reads for colour-blind users and in VoiceOver.
 */
export function Pill({ status, label, compact = false }: PillProps) {
  const theme = useTheme();
  const text = label ?? STATUS_LABEL[status];

  return (
    <View
      accessibilityLabel={text}
      style={[
        styles.base,
        {
          backgroundColor: theme.colors[`${status}Soft`],
          borderRadius: theme.radius.pill,
          paddingHorizontal: compact ? theme.space.sm : theme.space.md,
          paddingVertical: compact ? 2 : theme.space.xs,
        },
      ]}
    >
      <Icon name={STATUS_ICON[status]} size={compact ? 11 : 13} color={status} weight="bold" />
      <Text variant={compact ? 'label' : 'caption'} color={status} style={styles.text}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start' },
  text: { fontWeight: '600' },
});
