import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { usePurchases } from '@/hooks/usePurchases';
import { useTheme } from '@/hooks/useTheme';
import { Button, Icon, Screen, Text } from '@/ui/components';

const FEATURES: { icon: string; label: string }[] = [
  { icon: 'person.2.fill', label: 'Track every child, not just one' },
  { icon: 'doc.text.fill', label: 'Share the record as a PDF at the clinic' },
  { icon: 'arrow.triangle.2.circlepath', label: 'Back up and restore if you change phones' },
];

/**
 * Presented as a sheet from wherever a gate is hit (add-child, PDF export).
 * `reason` just changes the opening line — the offer underneath is identical,
 * because Kati Plus is the same three things everywhere.
 */
export default function Paywall() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ reason?: string }>();
  const { packages, loadingPackages, purchasing, purchase, restore } = usePurchases();
  const [error, setError] = useState<string | null>(null);

  const pkg = packages[0];
  const headline =
    params.reason === 'pdf-export'
      ? 'Sharing the record needs Kati Plus'
      : params.reason === 'backup'
        ? 'Backup needs Kati Plus'
        : 'Add another child with Kati Plus';

  async function onPurchase() {
    if (!pkg) return;
    setError(null);
    const result = await purchase(pkg.identifier);
    if (result === 'purchased') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } else if (result === 'error') {
      setError('Something went wrong. Try again.');
    }
    // 'cancelled' / 'pending': stay on the sheet, no error — the user backed out.
  }

  async function onRestore() {
    setError(null);
    const restored = await restore();
    if (restored) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } else {
      Alert.alert(
        'Nothing to restore',
        'No previous Kati Plus purchase was found on this account.',
      );
    }
  }

  return (
    <Screen header contentStyle={{ gap: theme.space.xl }}>
      <View style={styles.titleRow}>
        <Text variant="label" color="primary">
          Kati Plus
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={12}
          onPress={() => router.back()}
          style={[
            styles.close,
            { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.pill },
          ]}
        >
          <Icon name="xmark" size={14} color="inkMuted" weight="bold" />
        </Pressable>
      </View>

      <Text variant="title">{headline}</Text>

      <View style={{ gap: theme.space.lg }}>
        {FEATURES.map((f) => (
          <View key={f.label} style={[styles.feature, { gap: theme.space.md }]}>
            <View
              style={[
                styles.featureIcon,
                { backgroundColor: theme.colors.primarySoft, borderRadius: theme.radius.md },
              ]}
            >
              <Icon name={f.icon} size={18} color="primary" />
            </View>
            <Text variant="body" style={styles.featureText}>
              {f.label}
            </Text>
          </View>
        ))}
      </View>

      <View
        style={[
          styles.priceCard,
          {
            backgroundColor: theme.colors.surfaceMuted,
            borderRadius: theme.radius.lg,
            padding: theme.space.lg,
            gap: 2,
          },
        ]}
      >
        {loadingPackages || !pkg ? (
          <Text variant="callout" color="inkMuted">
            Loading price…
          </Text>
        ) : (
          <>
            <Text variant="bodyStrong">{pkg.priceString}</Text>
            {pkg.trialPeriod ? (
              <Text variant="callout" color="primary">
                Starts with a {pkg.trialPeriod} free trial
              </Text>
            ) : null}
            <Text variant="caption" color="inkSoft">
              Cancel any time in Settings before the trial ends and you won’t be charged.
            </Text>
          </>
        )}
      </View>

      {error ? (
        <Text variant="callout" color="overdue">
          {error}
        </Text>
      ) : null}

      <View style={{ gap: theme.space.sm }}>
        <Button
          label={pkg?.trialPeriod ? 'Start free trial' : 'Continue'}
          block
          disabled={!pkg}
          loading={purchasing === pkg?.identifier}
          onPress={onPurchase}
        />
        <Button
          label="Restore purchases"
          variant="ghost"
          block
          loading={purchasing === 'restore'}
          onPress={onRestore}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  close: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  feature: { flexDirection: 'row', alignItems: 'center' },
  featureIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  featureText: { flex: 1 },
  priceCard: {},
});
