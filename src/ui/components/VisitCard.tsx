import { StyleSheet, View } from 'react-native';

import type { ScheduleItem, ScheduleVisit } from '@/contracts';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/ui/components/Card';
import { DoseRow } from '@/ui/components/DoseRow';
import { Pill } from '@/ui/components/Pill';
import { Text } from '@/ui/components/Text';
import { formatDate, formatDueIn, formatOverdue } from '@/ui/format';

interface VisitCardProps {
  visit: ScheduleVisit;
  onPressDose?: (item: ScheduleItem) => void;
}

/**
 * One clinic trip. A parent thinks "when do I next go", not "when is PCV 2
 * due" — so the visit is the unit, and the doses sit inside it.
 */
export function VisitCard({ visit, onPressDose }: VisitCardProps) {
  const theme = useTheme();
  const { status, complete } = visit;

  const pillLabel =
    status === 'overdue'
      ? formatOverdue(visit.daysUntilDue)
      : status === 'due'
        ? formatDueIn(visit.daysUntilDue)
        : undefined;

  const stripe = complete ? undefined : status === 'upcoming' ? undefined : theme.colors[status];

  return (
    <Card stripe={stripe} muted={complete} padded={false}>
      <View
        style={[
          styles.head,
          {
            paddingHorizontal: theme.space.lg,
            paddingTop: theme.space.lg,
            paddingBottom: theme.space.sm,
            gap: theme.space.sm,
          },
        ]}
      >
        <View style={styles.headText}>
          <Text variant="heading" color={complete ? 'inkMuted' : 'ink'}>
            {visit.visitLabel}
          </Text>
          <Text variant="callout" color="inkMuted">
            {formatDate(visit.dueDate)}
            {!complete && status === 'upcoming' ? `  ·  ${formatDueIn(visit.daysUntilDue)}` : ''}
          </Text>
        </View>
        <Pill status={complete ? 'given' : status} label={complete ? 'Done' : pillLabel} compact />
      </View>

      <View style={{ paddingHorizontal: theme.space.lg, paddingBottom: theme.space.xs }}>
        {visit.items.map((item, i) => (
          <DoseRow
            key={item.dose.id}
            item={item}
            onPress={onPressDose}
            last={i === visit.items.length - 1}
          />
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap' },
  headText: { flex: 1, gap: 2 },
});
