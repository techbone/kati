import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import type { ScheduleItem } from '@/contracts';
import { useActiveChild } from '@/hooks/useActiveChild';
import { useSchedule } from '@/hooks/useSchedule';
import { useTheme } from '@/hooks/useTheme';
import { useToday } from '@/hooks/useToday';
import {
  Avatar,
  EmptyState,
  NextVisitHero,
  ProgressBar,
  Screen,
  Text,
  VisitCard,
} from '@/ui/components';
import { formatAge } from '@/ui/format';

export default function Home() {
  const theme = useTheme();
  const router = useRouter();
  const today = useToday();
  const child = useActiveChild();
  const schedule = useSchedule(child?.id ?? null);

  if (!child || !schedule) {
    return (
      <Screen scroll={false}>
        <EmptyState
          icon="person.crop.circle.badge.plus"
          title="No child yet"
          body="Add your child’s birth date and Kati will work out the whole schedule."
          action={{ label: 'Add a child', onPress: () => router.push('/(onboarding)/add-child') }}
        />
      </Screen>
    );
  }

  const { summary, visits } = schedule;
  const allDone = summary.nextVisit === null;

  function onPressDose(_item: ScheduleItem) {
    // M2: opens the dose detail sheet. Haptic so the tap already feels real.
    Haptics.selectionAsync();
  }

  return (
    <Screen contentStyle={{ gap: theme.space.xl }}>
      <View style={[styles.header, { gap: theme.space.md }]}>
        <Avatar name={child.name} size={48} />
        <View style={styles.headerText}>
          <Text variant="title">{child.name}</Text>
          <Text variant="callout" color="inkMuted">
            {formatAge(child.birthDate, today)}
          </Text>
        </View>
      </View>

      {summary.nextVisit ? (
        <NextVisitHero visit={summary.nextVisit} />
      ) : (
        <View
          style={[
            styles.doneBanner,
            { backgroundColor: theme.colors.givenSoft, borderRadius: theme.radius.xl, padding: theme.space.xl },
          ]}
        >
          <Text variant="title" color="given">
            Schedule complete
          </Text>
          <Text variant="callout" color="inkMuted">
            Every dose on the routine schedule is recorded.
          </Text>
        </View>
      )}

      <View style={{ gap: theme.space.sm }}>
        <View style={styles.progressRow}>
          <Text variant="callout" color="inkMuted">
            {summary.givenCount} of {summary.totalDoses} doses given
          </Text>
          {summary.overdueCount > 0 && !allDone ? (
            <Text variant="callout" color="overdue" style={styles.strong}>
              {summary.overdueCount} overdue
            </Text>
          ) : null}
        </View>
        <ProgressBar
          value={summary.completion}
          accessibilityLabel={`${summary.givenCount} of ${summary.totalDoses} doses given`}
        />
      </View>

      <View style={{ gap: theme.space.md }}>
        <Text variant="label" color="inkMuted">
          Clinic visits
        </Text>
        {visits.map((visit) => (
          <VisitCard key={visit.visitId} visit={visit} onPressDose={onPressDose} />
        ))}
      </View>

      <Text variant="caption" color="inkSoft" align="center" style={styles.footer}>
        Based on the national routine immunization schedule. Kati is a record-keeping aid, not
        medical advice.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center' },
  headerText: { flex: 1 },
  doneBanner: { gap: 4 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  strong: { fontWeight: '600' },
  footer: { paddingTop: 8 },
});
