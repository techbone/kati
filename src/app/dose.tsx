import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { asChildId, asDoseId, type ScheduleItem } from '@/contracts';
import { useFontScale } from '@/hooks/useFontScale';
import { useSchedule } from '@/hooks/useSchedule';
import { useAppStore } from '@/hooks/useStore';
import { useTheme } from '@/hooks/useTheme';
import { Button, Icon, Pill, Screen, Text } from '@/ui/components';
import { dateToISO, formatDate, formatDateLong, formatDueIn, formatOverdue, startOfToday } from '@/ui/format';

const ROUTE_LABEL = { oral: 'Oral drops', injection: 'Injection', intradermal: 'Injection' } as const;

/**
 * One dose. The second thing the demo shows: tap → mark given → the card
 * updates. Presented as a native sheet, so it renders its own title row.
 */
export default function DoseSheet() {
  const router = useRouter();
  const params = useLocalSearchParams<{ childId: string; doseId: string }>();
  const childId = asChildId(params.childId ?? '');
  const doseId = asDoseId(params.doseId ?? '');

  const schedule = useSchedule(childId);
  const item = schedule?.items.find((i) => i.dose.id === doseId) ?? null;

  if (!item) {
    return (
      <Screen header>
        <Text variant="callout" color="inkMuted">
          This dose isn’t on the schedule any more.
        </Text>
      </Screen>
    );
  }

  return <DoseDetail item={item} childId={childId} onClose={() => router.back()} />;
}

function DoseDetail({
  item,
  childId,
  onClose,
}: {
  item: ScheduleItem;
  childId: ReturnType<typeof asChildId>;
  onClose: () => void;
}) {
  const theme = useTheme();
  const k = useFontScale(1.6);
  const markGiven = useAppStore((s) => s.markGiven);
  const markSkipped = useAppStore((s) => s.markSkipped);
  const clearRecord = useAppStore((s) => s.clearRecord);

  const { dose, status, record } = item;
  const recorded = status === 'given' || status === 'skipped';

  // Form is shown for a pending dose, or when editing an existing record.
  const [editing, setEditing] = useState(false);
  const [givenDate, setGivenDate] = useState<Date>(() =>
    record?.givenDate ? new Date(record.givenDate + 'T00:00:00') : startOfToday(),
  );
  const [note, setNote] = useState(record?.note ?? '');
  const [busy, setBusy] = useState(false);
  const showForm = !recorded || editing;

  const dueLine =
    status === 'overdue'
      ? formatOverdue(item.daysUntilDue)
      : status === 'given' || status === 'skipped'
        ? formatDate(item.dueDate)
        : formatDueIn(item.daysUntilDue);

  async function save() {
    setBusy(true);
    await markGiven(childId, dose.id, dateToISO(givenDate), note.trim() || undefined);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  }

  async function skip() {
    setBusy(true);
    await markSkipped(childId, dose.id, note.trim() || undefined);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
  }

  async function undo() {
    setBusy(true);
    await clearRecord(childId, dose.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  }

  const inputStyle = {
    fontSize: 17 * k,
    minHeight: 48 * k,
    color: theme.colors.ink,
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.space.lg,
  };

  return (
    <Screen header contentStyle={{ gap: theme.space.xl }}>
      {/* Title row — sheets can't use the native header */}
      <View style={[styles.titleRow, { gap: theme.space.md }]}>
        <View style={[styles.titleText, { gap: 4 }]}>
          <Text variant="title">
            {dose.shortName}
            <Text variant="title" color="inkSoft">
              {'  '}
              {dose.doseLabel}
            </Text>
          </Text>
          <Text variant="callout" color="inkMuted">
            {dose.vaccineName} · {ROUTE_LABEL[dose.route]}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={12}
          onPress={onClose}
          style={[styles.close, { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.pill }]}
        >
          <Icon name="xmark" size={14} color="inkMuted" weight="bold" />
        </Pressable>
      </View>

      <View style={[styles.statusRow, { gap: theme.space.md }]}>
        <Pill status={status} label={status === 'overdue' ? dueLine : undefined} />
        <Text variant="callout" color="inkMuted">
          {status === 'overdue' ? `Due ${formatDate(item.dueDate)}` : status === 'given' || status === 'skipped' ? `Was due ${dueLine}` : `Due ${formatDate(item.dueDate)} · ${dueLine}`}
        </Text>
      </View>

      {dose.protectsAgainst.length > 0 ? (
        <View style={{ gap: theme.space.sm }}>
          <Text variant="label" color="inkMuted">
            Protects against
          </Text>
          <View style={[styles.chips, { gap: theme.space.sm }]}>
            {dose.protectsAgainst.map((d) => (
              <View
                key={d}
                style={[
                  styles.chip,
                  { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.pill },
                ]}
              >
                <Text variant="callout">{d}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {dose.note ? (
        <Text variant="callout" color="inkMuted">
          {dose.note}
        </Text>
      ) : null}

      {/* ---- Recorded state ---- */}
      {recorded && !editing ? (
        <View
          style={[
            styles.recordCard,
            {
              backgroundColor: status === 'given' ? theme.colors.givenSoft : theme.colors.skippedSoft,
              borderRadius: theme.radius.lg,
              padding: theme.space.lg,
              gap: theme.space.md,
            },
          ]}
        >
          <View style={[styles.statusRow, { gap: theme.space.sm }]}>
            <Icon
              name={status === 'given' ? 'checkmark.circle.fill' : 'minus.circle.fill'}
              size={20}
              color={status === 'given' ? 'given' : 'skipped'}
              weight="semibold"
            />
            <Text variant="bodyStrong" color={status === 'given' ? 'given' : 'inkMuted'}>
              {status === 'given' && record?.givenDate
                ? `Given on ${formatDateLong(record.givenDate)}`
                : 'Marked as skipped'}
            </Text>
          </View>
          {record?.note ? (
            <Text variant="callout" color="inkMuted">
              {record.note}
            </Text>
          ) : null}
          <View style={[styles.actions, { gap: theme.space.sm }]}>
            {status === 'given' ? (
              <Button label="Change" variant="secondary" icon="pencil" onPress={() => setEditing(true)} />
            ) : null}
            <Button label="Undo" variant="ghost" icon="arrow.uturn.backward" onPress={undo} disabled={busy} />
          </View>
        </View>
      ) : null}

      {/* ---- Form: pending, or editing a given record ---- */}
      {showForm ? (
        <View style={{ gap: theme.space.lg }}>
          <View style={{ gap: theme.space.sm }}>
            <Text variant="label" color="inkMuted">
              Date given
            </Text>
            <View
              style={[
                styles.dateRow,
                { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.md, paddingHorizontal: theme.space.lg },
              ]}
            >
              <Text variant="body">{formatDateLong(dateToISO(givenDate))}</Text>
              <DateTimePicker
                value={givenDate}
                mode="date"
                display="compact"
                maximumDate={new Date()}
                onChange={(_, d) => d && setGivenDate(d)}
                themeVariant={theme.scheme}
                accentColor={theme.colors.primary}
              />
            </View>
          </View>

          <View style={{ gap: theme.space.sm }}>
            <Text variant="label" color="inkMuted">
              Note <Text variant="label" color="inkSoft">(optional)</Text>
            </Text>
            <TextInput
              id="dose-note"
              value={note}
              onChangeText={setNote}
              placeholder="Clinic, batch number, anything worth keeping"
              placeholderTextColor={theme.colors.inkSoft}
              allowFontScaling={false}
              returnKeyType="done"
              style={inputStyle}
            />
          </View>

          <View style={{ gap: theme.space.sm }}>
            <Button
              label={editing ? 'Save changes' : 'Mark as given'}
              icon="checkmark"
              block
              loading={busy}
              onPress={save}
            />
            {editing ? (
              <Button label="Cancel" variant="ghost" block onPress={() => setEditing(false)} />
            ) : (
              <Button label="Skip this dose" variant="ghost" block disabled={busy} onPress={skip} />
            )}
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'flex-start' },
  titleText: { flex: 1 },
  close: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  statusRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { paddingHorizontal: 12, paddingVertical: 6 },
  recordCard: {},
  actions: { flexDirection: 'row', flexWrap: 'wrap' },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48 },
});
