import { SymbolView, type SymbolViewProps } from 'expo-symbols';

import { useTheme } from '@/hooks/useTheme';
import type { Palette } from '@/ui/theme';

interface IconProps {
  /** SF Symbol name, e.g. 'syringe.fill'. iPhone-only app, so iOS names are fine. */
  name: string;
  size?: number;
  color?: keyof Palette;
  weight?: SymbolViewProps['weight'];
}

/** SF Symbols with palette colours. Native rendering, zero bundle cost. */
export function Icon({ name, size = 20, color = 'ink', weight = 'medium' }: IconProps) {
  const theme = useTheme();
  return (
    <SymbolView
      name={name as SymbolViewProps['name']}
      size={size}
      tintColor={theme.colors[color]}
      weight={weight}
      resizeMode="scaleAspectFit"
    />
  );
}
