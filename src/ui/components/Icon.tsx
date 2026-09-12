import { SymbolView, type SymbolViewProps } from 'expo-symbols';

import { useFontScale } from '@/hooks/useFontScale';
import { useTheme } from '@/hooks/useTheme';
import type { Palette } from '@/ui/theme';

interface IconProps {
  /** SF Symbol name, e.g. 'syringe.fill'. iPhone-only app, so iOS names are fine. */
  name: string;
  size?: number;
  color?: keyof Palette;
  weight?: SymbolViewProps['weight'];
}

/**
 * SF Symbols with palette colours. Native rendering, zero bundle cost.
 * Scales with Dynamic Type (capped) so an icon beside large text keeps pace
 * with it instead of looking shrunken.
 */
export function Icon({ name, size = 20, color = 'ink', weight = 'medium' }: IconProps) {
  const theme = useTheme();
  const k = useFontScale(1.3);
  return (
    <SymbolView
      name={name as SymbolViewProps['name']}
      size={size * k}
      tintColor={theme.colors[color]}
      weight={weight}
      resizeMode="scaleAspectFit"
    />
  );
}
