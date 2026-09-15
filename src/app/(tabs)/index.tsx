import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, LinearTransition } from 'react-native-reanimated';

import type { ScheduleItem } from '@/contracts';
import { useActiveChild } from '@/hooks/useActiveChild';
import { useFontScale } from '@/hooks/useFontScale';
import { useMotion } from '@/hooks/useMotion';
import { useSchedule } from '@/hooks/useSchedule';
import { scheduleSource, useAppStore } from '@/hooks/useStore';
import { useTheme } from '@/hooks/useTheme';
import { useToday } from '@/hooks/useToday';
import {
  Avatar,
  EmptyState,
  Icon,
  NextVisitHero,
  ProgressBar,
  Screen,
  Text,
  TimelineRow,
  VisitCard,
} from '@/ui/components';
import { dateToISO, formatAge } from '@/ui/format';

export default function Home() {
  const theme = useTheme();
  const router = useRouter();
  const today = useToday();
  const child = useActiveChild();
  const schedule = useSchedule(child?.id ?? null);
  const markGiven = useAppStore((s) => s.markGiven);
  const chrome = useFontScale(1.3);
  const { motion } = useMotion();

  if (!child || !schedule) {
    return (
      <Screen>
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
  const childId = child.id;

  function onPressDose(item: ScheduleItem) {
    Haptics.selectionAsync();
    router.push({ pathname: '/dose', params: { childId, doseId: item.dose.id } });
  }

  // Swipe = "given today". Anything else (a past date, a note) goes through the sheet.
  async function onSwipeGive(item: ScheduleItem) {
    await markGiven(childId, item.dose.id, dateToISO(today));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  return (
    <Screen contentStyle={{ gap: theme.space.xl }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${child.name}, ${formatAge(child.birthDate, today)}. Switch or add a child`}
        onPress={() => router.push('/children')}
        style={({ pressed }) => [
          styles.header,
          { gap: theme.space.md, opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Avatar name={child.name} size={48} />
        <View style={styles.headerText}>
          <Text variant="title">{child.name}</Text>
          <Text variant="callout" color="inkMuted">
            {formatAge(child.birthDate, today)}
          </Text>
        </View>
        <View
          style={[
            styles.switchBtn,
            {
              width: 36 * chrome,
              height: 36 * chrome,
              backgroundColor: theme.colors.surfaceMuted,
              borderRadius: theme.radius.pill,
            },
          ]}
        >
          <Icon name="person.2.fill" size={16} color="inkMuted" />
        </View>
      </Pressable>

      {summary.nextVisit ? (
        <Animated.View
          key={`${summary.nextVisit.visitId}-${summary.nextVisit.status}`}
          entering={motion(FadeIn.duration(350))}
          layout={motion(LinearTransition.springify().damping(18))}
        >
          <NextVisitHero visit={summary.nextVisit} />
        </Animated.View>
      ) : (
        <View
          style={[
            styles.doneBanner,
            {
              backgroundColor: theme.colors.givenSoft,
              borderRadius: theme.radius.xl,
              padding: theme.space.xl,
            },
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

      <View style={{ gap: theme.space.sm }}>
        <Text variant="label" color="inkMuted" style={styles.sectionLabel}>
          Clinic visits
        </Text>
        {visits.map((visit, i) => (
          <Animated.View
            key={visit.visitId}
            entering={motion(FadeInDown.delay(Math.min(i, 6) * 45).duration(320))}
            layout={motion(LinearTransition.springify().damping(18))}
          >
            <TimelineRow
              status={visit.status}
              complete={visit.complete}
              first={i === 0}
              last={i === visits.length - 1}
            >
              <View style={styles.cardSpacing}>
                <VisitCard visit={visit} onPressDose={onPressDose} onSwipeGive={onSwipeGive} />
              </View>
            </TimelineRow>
          </Animated.View>
        ))}
      </View>

      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`Schedule source: ${scheduleSource.name}. Opens in browser.`}
        onPress={() => Linking.openURL(scheduleSource.url)}
        style={styles.footer}
      >
        <Text variant="caption" color="inkSoft" align="center">
          Schedule:{' '}
          <Text variant="caption" color="primary">
            {scheduleSource.name}
          </Text>{' '}
          · Kati is a record-keeping aid, not medical advice.
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center' },
  headerText: { flex: 1 },
  switchBtn: { alignItems: 'center', justifyContent: 'center' },
  doneBanner: { gap: 4 },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 8,
  },
  strong: { fontWeight: '600' },
  sectionLabel: { marginBottom: 4 },
  cardSpacing: { paddingBottom: 12 },
  footer: { paddingTop: 8 },
});
