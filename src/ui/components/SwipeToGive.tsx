import type { PropsWithChildren } from 'react';
import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import ReanimatedSwipeable, {
  SwipeDirection,
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { Icon } from '@/ui/components/Icon';
import { Text } from '@/ui/components/Text';

interface SwipeToGiveProps extends PropsWithChildren {
  /** Off for doses that are already given or skipped — those go through the sheet. */
  enabled: boolean;
  onGive: () => void;
}

const THRESHOLD = 88;

function GiveAction({ progress }: { progress: SharedValue<number> }) {
  const theme = useTheme();
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.6, 1], [0, 0.6, 1]),
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.7, 1]) }],
  }));
  return (
    <View
      style={[styles.action, { backgroundColor: theme.colors.given, paddingLeft: theme.space.lg }]}
    >
      <Animated.View style={[styles.actionInner, style]}>
        <Icon name="checkmark.circle.fill" size={22} color="onPrimary" weight="bold" />
        <Text variant="bodyStrong" color="onPrimary">
          Given today
        </Text>
      </Animated.View>
    </View>
  );
}

/**
 * Swipe a pending dose to the right to mark it given today. The green panel
 * grows under the row as you drag; past the threshold, releasing commits.
 * The row snaps back on its own — the store update re-renders it as given
 * and the tick springs in.
 */
export function SwipeToGive({ enabled, onGive, children }: SwipeToGiveProps) {
  const theme = useTheme();
  const ref = useRef<SwipeableMethods>(null);

  if (!enabled) return <>{children}</>;

  return (
    <ReanimatedSwipeable
      ref={ref}
      friction={1.4}
      leftThreshold={THRESHOLD}
      overshootLeft={false}
      dragOffsetFromLeftEdge={12}
      renderLeftActions={(progress) => <GiveAction progress={progress} />}
      onSwipeableOpen={(direction) => {
        if (direction !== SwipeDirection.LEFT) return;
        onGive();
        ref.current?.close();
      }}
      childrenContainerStyle={{ backgroundColor: theme.colors.surface }}
    >
      {children}
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
  action: { flex: 1, justifyContent: 'center' },
  actionInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
