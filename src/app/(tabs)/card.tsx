import { useRouter } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';

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

  function share() {
    if (!allows('pdf-export')) {
      router.push({ pathname: '/paywall', params: { reason: 'pdf-export' } });
      return;
    }
    // M3: Track C's ExportService.sharePdf().
    Alert.alert('Export', 'PDF export arrives with the next milestone.');
  }

  return (
    <Screen contentStyle={{ gap: theme.space.lg }}>
      <View style={styles.titleRow}>
        <Text variant="title">Card</Text>
        <Button label="Share PDF" icon="square.and.arrow.up" variant="secondary" onPress={share} />
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
