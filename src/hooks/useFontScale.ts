import { useWindowDimensions } from 'react-native';

/**
 * The device Dynamic Type multiplier, capped. Use this anywhere text is sized
 * outside the `Text` primitive (inputs, pickers) so everything scales the same
 * way and nothing depends on RN's own font-scaling path.
 */
export function useFontScale(maxScale = 2): number {
  const { fontScale } = useWindowDimensions();
  return Math.min(fontScale, maxScale);
}
