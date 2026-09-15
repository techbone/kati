import { useReducedMotion } from 'react-native-reanimated';

/**
 * Gate for every entering / layout animation in the app.
 *
 * When the user has Reduce Motion on, Reanimated's layout transitions don't
 * just skip the animation — they can leave a view stuck at its previous frame
 * (an expanded card clipped to its collapsed height). So under Reduce Motion
 * we pass no animation at all: plain views, instant layout, nothing to get
 * stuck. Use `motion(anim)` on every `entering` and `layout` prop.
 */
export function useMotion() {
  const reduced = useReducedMotion();
  return {
    reduced,
    motion<T>(anim: T): T | undefined {
      return reduced ? undefined : anim;
    },
  };
}
