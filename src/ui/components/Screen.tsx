import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/useTheme';
import { gutter } from '@/ui/theme';

interface ScreenProps extends PropsWithChildren {
  /** Scrollable content (default) or a fixed layout that manages its own scrolling. */
  scroll?: boolean;
  /** Skip the top inset, e.g. when a navigation header is present. */
  header?: boolean;
  /** Extra padding at the bottom for a floating action. */
  bottomInset?: number;
  contentStyle?: ViewStyle;
}

/** Page container. Owns background, safe areas and the horizontal gutter. */
export function Screen({
  children,
  scroll = true,
  header = false,
  bottomInset = 0,
  contentStyle,
}: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const padding: ViewStyle = {
    paddingTop: header ? theme.space.lg : insets.top + theme.space.md,
    paddingBottom: insets.bottom + theme.space.xl + bottomInset,
    paddingHorizontal: gutter,
  };

  if (!scroll) {
    return (
      <View style={[styles.root, { backgroundColor: theme.colors.bg }]}>
        <View style={[styles.grow, padding, contentStyle]}>{children}</View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: theme.colors.bg }]}
      // flexGrow (not flex) on the content container: it fills the viewport
      // when content is short — so a `justifyContent: 'space-between'` layout
      // still spreads edge to edge — and simply grows past it when content is
      // taller, e.g. at large Dynamic Type sizes, instead of clipping.
      contentContainerStyle={[styles.grow, padding, contentStyle]}
      contentInsetAdjustmentBehavior="never"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  grow: { flexGrow: 1 },
});
