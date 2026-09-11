import { StyleSheet, Text, View } from 'react-native';

/** Placeholder. Track B replaces this with the boot/redirect gate in M2. */
export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kati</Text>
      <Text style={styles.subtitle}>Scaffold ready — M0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { fontSize: 32, fontWeight: '700' },
  subtitle: { fontSize: 15, opacity: 0.6 },
});
