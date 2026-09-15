import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { ScheduleItem, ScheduleVisit } from '@/contracts';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/ui/components/Card';
import { DoseRow } from '@/ui/components/DoseRow';
import { Icon } from '@/ui/components/Icon';
import { Pill } from '@/ui/components/Pill';
import { SwipeToGive } from '@/ui/components/SwipeToGive';
import { Text } from '@/ui/components/Text';
import { formatDate, formatDueIn, formatOverdue, pluralDoses } from '@/ui/format';

interface VisitCardProps {
  visit: ScheduleVisit;
  onPressDose?: (item: ScheduleItem) => void;
  /** Swipe-right on a pending dose. Omit to disable the gesture. */
  onSwipeGive?: (item: ScheduleItem) => void;
}

/**
 * One clinic trip. A parent thinks "when do I next go", not "when is PCV 2
 * due" — so the visit is the unit, and the doses sit inside it.
 *
 * A finished visit collapses to a single line so the timeline stays about
 * what's next; tap it to see the doses again.
 */
export function VisitCard({ visit, onPressDose, onSwipeGive }: VisitCardProps) {
  const theme = useTheme();
  const { status, complete } = visit;
  const [expanded, setExpanded] = useState(false);
  const collapsed = complete && !expanded;

  const pillLabel =
    status === 'overdue'
      ? formatOverdue(visit.daysUntilDue)
      : status === 'due'
        ? formatDueIn(visit.daysUntilDue)
        : undefined;

  const stripe = complete ? undefined : status === 'upcoming' ? undefined : theme.colors[status];

  if (collapsed) {
    return (
      <Card muted padded={false}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${visit.visitLabel}, done, ${pluralDoses(visit.items.length)}. Show doses`}
          onPress={() => setExpanded(true)}
          style={({ pressed }) => [
            styles.collapsed,
            {
              paddingHorizontal: theme.space.lg,
              paddingVertical: theme.space.md,
              gap: theme.space.md,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Icon name="checkmark.circle.fill" size={18} color="given" weight="semibold" />
          <View style={styles.headText}>
            <Text variant="bodyStrong" color="inkMuted">
              {visit.visitLabel}
              <Text variant="body" color="inkSoft">
                {'  '}
                {pluralDoses(visit.items.length)}
              </Text>
            </Text>
          </View>
          <Text variant="caption" color="inkSoft">
            {formatDate(visit.dueDate)}
          </Text>
          <Icon name="chevron.down" size={12} color="inkSoft" />
        </Pressable>
      </Card>
    );
  }

  return (
    <Card stripe={stripe} muted={complete} padded={false}>
      <View
        accessible
        accessibilityRole="header"
        accessibilityLabel={`${visit.visitLabel}, ${formatDate(visit.dueDate)}, ${complete ? 'done' : (pillLabel ?? status)}`}
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
        {complete ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Hide doses"
            hitSlop={10}
            onPress={() => setExpanded(false)}
          >
            <Pill status="given" label="Done" compact />
          </Pressable>
        ) : (
          <Pill status={status} label={pillLabel} compact />
        )}
      </View>

      <View style={{ paddingBottom: theme.space.xs }}>
        {visit.items.map((item, i) => (
          <SwipeToGive
            key={item.dose.id}
            enabled={!!onSwipeGive && item.status !== 'given' && item.status !== 'skipped'}
            onGive={() => onSwipeGive?.(item)}
          >
            <DoseRow item={item} onPress={onPressDose} last={i === visit.items.length - 1} />
          </SwipeToGive>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  headText: { flex: 1, gap: 2 },
  collapsed: { flexDirection: 'row', alignItems: 'center' },
});
