import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import type { ChildId } from '@/contracts';
import { usePremium } from '@/hooks/usePremium';
import { useAppStore } from '@/hooks/useStore';
import { useTheme } from '@/hooks/useTheme';
import { useToday } from '@/hooks/useToday';
import { Avatar, Button, Card, Icon, Screen, Text } from '@/ui/components';
import { formatAge } from '@/ui/format';

/** Switch between children, or add one. Gated at FREE_CHILD_LIMIT until Kati Plus. */
export default function ChildrenModal() {
  const theme = useTheme();
  const router = useRouter();
  const today = useToday();
  const children = useAppStore((s) => s.children);
  const activeChildId = useAppStore((s) => s.activeChildId);
  const setActiveChild = useAppStore((s) => s.setActiveChild);
  const { allows } = usePremium();

  async function pick(id: ChildId) {
    Haptics.selectionAsync();
    await setActiveChild(id);
    router.back();
  }

  function add() {
    if (!allows('multiple-children')) {
      // M4: this becomes router.push('/paywall'). The gate lives here so that
      // change is one line.
      Alert.alert(
        'Kati Plus',
        'Tracking more than one child is part of Kati Plus. The upgrade arrives in a later build.',
      );
      return;
    }
    router.push('/(onboarding)/add-child');
  }

  return (
    <Screen header contentStyle={{ gap: theme.space.xl }}>
      <View style={styles.titleRow}>
        <Text variant="title">Children</Text>
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

      <View style={{ gap: theme.space.sm }}>
        {children.map((child) => {
          const active = child.id === activeChildId;
          return (
            <Card
              key={child.id}
              onPress={() => pick(child.id)}
              accessibilityLabel={`${child.name}, ${formatAge(child.birthDate, today)}${active ? ', selected' : ''}`}
              style={active ? { borderColor: theme.colors.primary, borderWidth: 1.5 } : undefined}
            >
              <View style={[styles.row, { gap: theme.space.md }]}>
                <Avatar name={child.name} size={44} />
                <View style={styles.rowText}>
                  <Text variant="bodyStrong">{child.name}</Text>
                  <Text variant="callout" color="inkMuted">
                    {formatAge(child.birthDate, today)}
                  </Text>
                </View>
                {active ? <Icon name="checkmark.circle.fill" size={22} color="primary" /> : null}
              </View>
            </Card>
          );
        })}
      </View>

      <Button label="Add a child" icon="plus" variant="secondary" block onPress={add} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  close: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowText: { flex: 1 },
});
