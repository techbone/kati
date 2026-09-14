import DateTimePicker from '@react-native-community/datetimepicker';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Switch, View } from 'react-native';

import {
  isExpoGo,
  notificationService,
  presentCustomerCenter,
  purchaseService,
} from '@/hooks/services';
import { useAppStore } from '@/hooks/useStore';
import { useTheme } from '@/hooks/useTheme';
import { useToday } from '@/hooks/useToday';
import { Avatar, Card, Row, Screen, Text } from '@/ui/components';
import { formatAge } from '@/ui/format';

/** Days-before-due options. Order matters: the contract wants leadDays descending. */
const LEAD_OPTIONS: { days: number; label: string }[] = [
  { days: 7, label: '1 week before' },
  { days: 3, label: '3 days before' },
  { days: 1, label: 'Day before' },
  { days: 0, label: 'On the day' },
];

function timeToDate(hour: number, minute: number): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

function formatTime(hour: number, minute: number): string {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${String(minute).padStart(2, '0')} ${hour < 12 ? 'am' : 'pm'}`;
}

export default function SettingsTab() {
  const theme = useTheme();
  const router = useRouter();
  const today = useToday();
  const prefs = useAppStore((s) => s.prefs);
  const setPrefs = useAppStore((s) => s.setPrefs);
  const refreshReminders = useAppStore((s) => s.refreshReminders);
  const children = useAppStore((s) => s.children);
  const isPremium = useAppStore((s) => s.isPremium);
  const { reminders } = prefs;
  const [busy, setBusy] = useState<'restore' | 'manage' | null>(null);
  const [scheduledCount, setScheduledCount] = useState<number | null>(null);

  // Diagnostics: how many reminders iOS is actually holding. Refreshed each
  // time the tab is focused so it reflects the last sync, not the first.
  useFocusEffect(
    useCallback(() => {
      let live = true;
      notificationService
        .getScheduledCount()
        .then((n) => live && setScheduledCount(n))
        .catch(() => live && setScheduledCount(null));
      return () => {
        live = false;
      };
    }, []),
  );

  async function updateReminders(patch: Partial<typeof reminders>) {
    await setPrefs({ reminders: { ...reminders, ...patch } });
    // Track A's store derives the plan from prefs and hands it to the scheduler.
    await refreshReminders();
    notificationService
      .getScheduledCount()
      .then(setScheduledCount)
      .catch(() => {});
  }

  async function toggleReminders(on: boolean) {
    if (!on) {
      await updateReminders({ enabled: false });
      return;
    }
    // Ask for permission at the moment the user opts in — the one time the
    // system prompt makes sense. Denied → leave the switch off and point at
    // Settings; never re-prompt on every toggle.
    const state = await notificationService.requestPermission();
    if (state !== 'granted') {
      Alert.alert(
        'Notifications are off',
        'Kati can’t remind you until notifications are allowed for it in iOS Settings.',
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ],
      );
      return;
    }
    await updateReminders({ enabled: true });
  }

  function toggleLead(days: number) {
    Haptics.selectionAsync();
    const has = reminders.leadDays.includes(days);
    const next = has
      ? reminders.leadDays.filter((d) => d !== days)
      : [...reminders.leadDays, days].sort((a, b) => b - a);
    if (next.length === 0) return; // reminders on with nothing selected is a trap
    updateReminders({ leadDays: next });
  }

  async function onRestore() {
    setBusy('restore');
    try {
      const restored = await purchaseService.restore();
      Alert.alert(
        restored ? 'Restored' : 'Nothing to restore',
        restored
          ? 'Kati Plus is active on this device.'
          : 'No previous Kati Plus purchase was found for this Apple ID.',
      );
    } catch (err) {
      Alert.alert('Couldn’t restore', err instanceof Error ? err.message : 'Try again later.');
    } finally {
      setBusy(null);
    }
  }

  async function onManage() {
    setBusy('manage');
    try {
      await presentCustomerCenter();
    } catch (err) {
      Alert.alert('Couldn’t open', err instanceof Error ? err.message : 'Try again later.');
    } finally {
      setBusy(null);
    }
  }

  const version = Constants.expoConfig?.version ?? '—';

  return (
    <Screen contentStyle={{ gap: theme.space.xl }}>
      <Text variant="title">Settings</Text>

      <Section label="Reminders">
        <Card padded={false}>
          <Row
            label="Remind me before clinic visits"
            icon="bell.badge.fill"
            right={
              <Switch
                value={reminders.enabled}
                onValueChange={toggleReminders}
                trackColor={{ true: theme.colors.primary, false: theme.colors.line }}
                accessibilityLabel="Reminders"
              />
            }
            divider={reminders.enabled}
          />
          {reminders.enabled ? (
            <>
              <Row
                label="Time"
                detail="Reminders arrive at this time"
                right={
                  <DateTimePicker
                    value={timeToDate(reminders.hour, reminders.minute)}
                    mode="time"
                    display="compact"
                    minuteInterval={5}
                    onChange={(_, d) =>
                      d && updateReminders({ hour: d.getHours(), minute: d.getMinutes() })
                    }
                    themeVariant={theme.scheme}
                    accentColor={theme.colors.primary}
                    accessibilityLabel={`Reminder time, ${formatTime(reminders.hour, reminders.minute)}`}
                  />
                }
              />
              <View style={{ padding: theme.space.lg, gap: theme.space.sm }}>
                <Text variant="caption" color="inkMuted">
                  When to remind
                </Text>
                <View style={[styles.chips, { gap: theme.space.sm }]}>
                  {LEAD_OPTIONS.map((o) => {
                    const on = reminders.leadDays.includes(o.days);
                    return (
                      <Pressable
                        key={o.days}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: on }}
                        accessibilityLabel={o.label}
                        onPress={() => toggleLead(o.days)}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: on
                              ? theme.colors.primarySoft
                              : theme.colors.surfaceMuted,
                            borderColor: on ? theme.colors.primary : 'transparent',
                            borderRadius: theme.radius.pill,
                          },
                        ]}
                      >
                        <Text
                          variant="callout"
                          color={on ? 'primary' : 'inkMuted'}
                          style={styles.chipText}
                        >
                          {o.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
              <Row
                label="Scheduled on this phone"
                detail="iOS holds at most 64; Kati keeps it under 48"
                value={scheduledCount === null ? '—' : String(scheduledCount)}
                divider={false}
              />
            </>
          ) : null}
        </Card>
      </Section>

      <Section label="Children">
        <Card padded={false}>
          {children.map((c) => (
            <Row
              key={c.id}
              label={c.name}
              detail={formatAge(c.birthDate, today)}
              right={<Avatar name={c.name} size={32} />}
            />
          ))}
          <Row
            label="Add or switch child"
            icon="person.2.fill"
            onPress={() => router.push('/children')}
            divider={false}
          />
        </Card>
      </Section>

      <Section label="Kati Plus">
        <Card padded={false}>
          <Row
            label={isPremium ? 'Kati Plus is active' : 'Free plan'}
            detail={
              isPremium
                ? 'Unlimited children, PDF export, backup'
                : 'One child. Upgrade for more children, PDF export and backup.'
            }
            icon={isPremium ? 'checkmark.seal.fill' : 'star'}
          />
          {isPremium ? (
            <Row
              label="Manage plan"
              detail="Change, cancel, or restore your subscription"
              onPress={onManage}
              right={
                busy === 'manage' ? (
                  <Text variant="caption" color="inkSoft">
                    Opening…
                  </Text>
                ) : undefined
              }
            />
          ) : null}
          <Row
            label="Restore purchases"
            onPress={onRestore}
            divider={false}
            right={
              busy === 'restore' ? (
                <Text variant="caption" color="inkSoft">
                  Checking…
                </Text>
              ) : undefined
            }
          />
        </Card>
      </Section>

      <Section label="About">
        <Card padded={false}>
          <Row label="Schedule" value={prefs.scheduleVersion} />
          <Row
            label="Version"
            value={isExpoGo ? `${version} · Expo Go` : version}
            divider={false}
          />
        </Card>
        <Text variant="caption" color="inkSoft" style={styles.about}>
          Kati keeps everything on this phone. Nothing is uploaded or shared unless you export it
          yourself. It is a record-keeping aid, not medical advice — always follow your clinic’s
          guidance.
        </Text>
      </Section>
    </Screen>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.space.sm }}>
      <Text variant="label" color="inkMuted" style={styles.sectionLabel}>
        {label}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: { paddingHorizontal: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1 },
  chipText: { fontWeight: '600' },
  about: { paddingHorizontal: 4 },
});
