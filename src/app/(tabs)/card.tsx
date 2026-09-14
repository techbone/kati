import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { exportService, presentPaywallIfNeeded } from '@/hooks/services';
import { useActiveChild } from '@/hooks/useActiveChild';
import { usePremium } from '@/hooks/usePremium';
import { useSchedule } from '@/hooks/useSchedule';
import { useAppStore } from '@/hooks/useStore';
import { useTheme } from '@/hooks/useTheme';
import { useToday } from '@/hooks/useToday';
import { Button, EmptyState, RecordCard, Screen, Text } from '@/ui/components';

/** The clinic-showable record, and the way out of the app: share it as a PDF. */
export default function CardTab() {
  const theme = useTheme();
  const router = useRouter();
  const today = useToday();
  const child = useActiveChild();
  const schedule = useSchedule(child?.id ?? null);
  const scheduleVersion = useAppStore((s) => s.prefs.scheduleVersion);
  const { allows } = usePremium();
  const [sharing, setSharing] = useState(false);

  if (!child || !schedule) {
    return (
      <Screen>
        <EmptyState
          icon="doc.text.fill"
          title="No record yet"
          body="Add a child and every dose you record will appear here, ready to show at the clinic."
          action={{ label: 'Add a child', onPress: () => router.push('/(onboarding)/add-child') }}
        />
      </Screen>
    );
  }

  async function share() {
    if (!child || !schedule) return;
    if (!allows('pdf-export')) {
      const outcome = await presentPaywallIfNeeded();
      if (outcome !== 'unlocked' && outcome !== 'not_presented') return;
    }
    setSharing(true);
    try {
      await exportService.sharePdf({
        child,
        items: schedule.items,
        summary: schedule.summary,
        scheduleSource: `Schedule ${scheduleVersion}`,
        generatedAt: new Date(),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      Alert.alert(
        'Couldn’t share the record',
        err instanceof Error ? err.message : 'Something went wrong. Try again.',
      );
    } finally {
      setSharing(false);
    }
  }

  return (
    <Screen contentStyle={{ gap: theme.space.lg }}>
      <View style={styles.titleRow}>
        <Text variant="title">Card</Text>
        <Button
          label="Share PDF"
          icon="square.and.arrow.up"
          variant="secondary"
          loading={sharing}
          onPress={share}
        />
      </View>
      <Text variant="callout" color="inkMuted">
        Show this at the clinic. It has every dose and the date it was given.
      </Text>

      <RecordCard
        child={child}
        visits={schedule.visits}
        summary={schedule.summary}
        scheduleSource={`Schedule ${scheduleVersion}`}
        today={today}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
});
