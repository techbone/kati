import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { Button, Icon, Screen, Text } from '@/ui/components';

const POINTS: { icon: string; title: string; body: string }[] = [
  {
    icon: 'calendar.badge.clock',
    title: 'The full schedule, from birth',
    body: 'Every clinic visit on the national immunization schedule, worked out from your child’s birth date.',
  },
  {
    icon: 'bell.badge.fill',
    title: 'A reminder before each visit',
    body: 'So a due date doesn’t slip past in a busy week.',
  },
  {
    icon: 'doc.text.fill',
    title: 'A record you can show',
    body: 'Every dose and its date, ready for the nurse — even if the paper card is lost.',
  },
];

export default function Welcome() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Screen contentStyle={styles.content}>
      <View style={{ gap: theme.space.md }}>
        <Text variant="label" color="primary">
          Kati
        </Text>
        <Text variant="display">Your child’s immunization card, on your phone.</Text>
        <Text variant="callout" color="inkMuted">
          Works offline. Stays on this phone. Nothing is uploaded anywhere.
        </Text>
      </View>

      <View style={{ gap: theme.space.xl }}>
        {POINTS.map((p) => (
          <View key={p.title} style={[styles.point, { gap: theme.space.lg }]}>
            <View
              style={[
                styles.pointIcon,
                { backgroundColor: theme.colors.primarySoft, borderRadius: theme.radius.md },
              ]}
            >
              <Icon name={p.icon} size={20} color="primary" />
            </View>
            <View style={[styles.pointText, { gap: 2 }]}>
              <Text variant="bodyStrong">{p.title}</Text>
              <Text variant="callout" color="inkMuted">
                {p.body}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={{ gap: theme.space.md }}>
        <Button
          label="Add your child"
          icon="plus"
          block
          onPress={() => router.push('/(onboarding)/add-child')}
        />
        <Text variant="caption" color="inkSoft" align="center">
          Kati is a record-keeping aid, not medical advice. Always follow your clinic’s guidance.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'space-between' },
  point: { flexDirection: 'row', alignItems: 'flex-start' },
  pointIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  pointText: { flex: 1 },
});
