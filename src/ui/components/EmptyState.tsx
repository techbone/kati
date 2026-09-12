import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/ui/components/Button';
import { Icon } from '@/ui/components/Icon';
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
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: theme.colors.primarySoft, borderRadius: theme.radius.pill },
        ]}
      >
        <Icon name={icon} size={30} color="primary" />
      </View>
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
  iconWrap: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center' },
  body: { maxWidth: 300 },
  action: { marginTop: 8 },
});
