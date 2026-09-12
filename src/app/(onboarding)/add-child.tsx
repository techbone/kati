import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import type { Sex } from '@/contracts';
import { useFontScale } from '@/hooks/useFontScale';
import { useAppStore } from '@/hooks/useStore';
import { useTheme } from '@/hooks/useTheme';
import { Button, Icon, Screen, Text } from '@/ui/components';
import { dateToISO, formatDateLong, startOfToday } from '@/ui/format';

const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: 'female', label: 'Girl' },
  { value: 'male', label: 'Boy' },
  { value: 'unspecified', label: 'Rather not say' },
];

export default function AddChild() {
  const theme = useTheme();
  const router = useRouter();
  const k = useFontScale(1.6);
  const addChild = useAppStore((s) => s.addChild);
  const setActiveChild = useAppStore((s) => s.setActiveChild);
  const setPrefs = useAppStore((s) => s.setPrefs);

  const [name, setName] = useState('');
  // Defaults to today: a child born today is a real case, and the picker only
  // fires onChange when the wheel moves, so a null default left Save disabled.
  const [birthDate, setBirthDate] = useState<Date>(startOfToday);
  const [sex, setSex] = useState<Sex>('unspecified');
  const [saving, setSaving] = useState(false);

  const canSave = name.trim().length > 0 && !saving;

  async function save() {
    setSaving(true);
    const id = await addChild({ name: name.trim(), birthDate: dateToISO(birthDate), sex });
    // Land on the child just added, whether this is the first or the fourth.
    await setActiveChild(id);
    await setPrefs({ onboarded: true });
    router.replace('/(tabs)');
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen contentStyle={{ gap: theme.space.xxl }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.back}
        >
          <Icon name="chevron.left" size={18} color="primary" weight="semibold" />
          <Text variant="bodyStrong" color="primary">
            Back
          </Text>
        </Pressable>

        <View style={{ gap: theme.space.sm }}>
          <Text variant="title">About your child</Text>
          <Text variant="callout" color="inkMuted">
            The birth date sets every due date on the schedule, so take a second to get it right.
          </Text>
        </View>

        <Field label="Name">
          <TextInput
            id="child-name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Amina"
            placeholderTextColor={theme.colors.inkSoft}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
            allowFontScaling={false}
            style={[
              styles.input,
              {
                fontSize: 17 * k,
                minHeight: 50 * k,
                color: theme.colors.ink,
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.line,
                borderRadius: theme.radius.md,
                paddingHorizontal: theme.space.lg,
              },
            ]}
          />
        </Field>

        <Field label="Date of birth" hint={formatDateLong(dateToISO(birthDate))}>
          <View
            style={[
              styles.pickerWrap,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.line,
                borderRadius: theme.radius.md,
              },
            ]}
          >
            <DateTimePicker
              value={birthDate}
              mode="date"
              display="spinner"
              maximumDate={new Date()}
              onChange={(_, d) => d && setBirthDate(d)}
              themeVariant={theme.scheme}
              style={styles.picker}
            />
          </View>
        </Field>

        <Field label="Sex">
          <View style={[styles.segment, { gap: theme.space.sm }]}>
            {SEX_OPTIONS.map((o) => {
              const on = sex === o.value;
              return (
                <Pressable
                  key={o.value}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  onPress={() => setSex(o.value)}
                  style={[
                    styles.segmentItem,
                    {
                      backgroundColor: on ? theme.colors.primary : theme.colors.surface,
                      borderColor: on ? theme.colors.primary : theme.colors.line,
                      borderRadius: theme.radius.md,
                    },
                  ]}
                >
                  <Text variant="callout" color={on ? 'onPrimary' : 'ink'} style={styles.segmentText}>
                    {o.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Field>

        <Button label="Save and see the schedule" block disabled={!canSave} loading={saving} onPress={save} />
      </Screen>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.space.sm }}>
      <View style={styles.fieldHead}>
        <Text variant="label" color="inkMuted">
          {label}
        </Text>
        {hint ? (
          <Text variant="caption" color="primary" style={styles.hint}>
            {hint}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf: 'flex-start' },
  input: { borderWidth: StyleSheet.hairlineWidth },
  pickerWrap: { borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  picker: { height: 180, alignSelf: 'stretch' },
  segment: { flexDirection: 'row', flexWrap: 'wrap' },
  segmentItem: {
    minHeight: 44,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderWidth: 1,
    flexGrow: 1,
  },
  segmentText: { fontWeight: '600', textAlign: 'center' },
  fieldHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  hint: { fontWeight: '600' },
});
