import { StyleSheet, View } from 'react-native';

import type { ScheduleVisit } from '@/contracts';
import { useTheme } from '@/hooks/useTheme';
import { Icon } from '@/ui/components/Icon';
import { Text } from '@/ui/components/Text';
import { formatDate, formatDueIn, formatOverdue, pluralDoses } from '@/ui/format';

interface NextVisitHeroProps {
  visit: ScheduleVisit;
}

/**
 * The answer to the only question a parent has when they open the app:
 * when do I next go, and is it late?
 */
export function NextVisitHero({ visit }: NextVisitHeroProps) {
  const theme = useTheme();
  const late = visit.status === 'overdue';
  const soon = visit.status === 'due';

  const bg = late
    ? theme.colors.overdueSoft
    : soon
      ? theme.colors.dueSoft
      : theme.colors.primarySoft;
  const accent = late ? 'overdue' : soon ? 'due' : 'primary';
  const eyebrow = late ? 'Overdue clinic visit' : soon ? 'Clinic visit due' : 'Next clinic visit';
  const when = late ? formatOverdue(visit.daysUntilDue) : formatDueIn(visit.daysUntilDue);

  const pending = visit.items.filter((i) => i.status !== 'given' && i.status !== 'skipped').length;

  return (
    <View
      accessibilityLabel={`${eyebrow}: ${visit.visitLabel}, ${formatDate(visit.dueDate)}, ${when}, ${pluralDoses(pending)}`}
      style={[
        styles.root,
        {
          backgroundColor: bg,
          borderRadius: theme.radius.xl,
          padding: theme.space.xl,
          gap: theme.space.lg,
        },
      ]}
    >
      <View style={[styles.row, { gap: theme.space.sm }]}>
        <Icon
          name={late ? 'exclamationmark.triangle.fill' : 'cross.case.fill'}
          size={14}
          color={accent}
          weight="bold"
        />
        <Text variant="label" color={accent}>
          {eyebrow}
        </Text>
      </View>

      <View style={{ gap: 2 }}>
        <Text variant="display" color={accent}>
          {visit.visitLabel}
        </Text>
        <Text variant="heading">{formatDate(visit.dueDate)}</Text>
      </View>

      <View style={[styles.row, styles.between]}>
        <Text variant="bodyStrong" color={accent}>
          {when}
        </Text>
        <Text variant="callout" color="inkMuted">
          {pluralDoses(pending)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {},
  row: { flexDirection: 'row', alignItems: 'center' },
  between: { justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
});
