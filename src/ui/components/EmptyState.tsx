import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/ui/components/Button';
import { IconBadge } from '@/ui/components/IconBadge';
import { Text } from '@/ui/components/Text';

interface EmptyStateProps {
  icon: string;
  title: string;
  body: string;
  action?: { label: string; onPress: () => void };
}

export function EmptyState({ icon, title, body, action }: EmptyStateProps) {
  const theme = useTheme();
  return (
    <View style={[styles.root, { gap: theme.space.md, paddingVertical: theme.space.xxxl }]}>
      <IconBadge name={icon} size={72} round />
      <Text variant="heading" align="center">
        {title}
      </Text>
      <Text variant="callout" color="inkMuted" align="center" style={styles.body}>
        {body}
      </Text>
      {action ? (
        <Button label={action.label} onPress={action.onPress} style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center' },
  body: { maxWidth: 300 },
  action: { marginTop: 8 },
});
