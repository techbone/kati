import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import type { Palette, TypeRoleName } from '@/ui/theme';

export interface TextProps extends RNTextProps {
  variant?: TypeRoleName;
  /** Semantic colour from the palette. Defaults to ink. */
  color?: keyof Palette;
  align?: 'left' | 'center' | 'right';
}

/**
 * The only way text is rendered in Kati. Picks a type role, a palette colour,
 * and the Dynamic Type ceiling for that role so nothing has to remember it.
 */
export function Text({ variant = 'body', color = 'ink', align, style, ...rest }: TextProps) {
  const theme = useTheme();
  const { maxScale, ...roleStyle } = theme.type[variant];

  return (
    <RNText
      maxFontSizeMultiplier={maxScale}
      {...rest}
      style={[roleStyle, { color: theme.colors[color] }, align && { textAlign: align }, style]}
    />
  );
}

