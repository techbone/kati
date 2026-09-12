import { Text as RNText, type TextProps as RNTextProps, useWindowDimensions } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import type { Palette, TypeRole, TypeRoleName } from '@/ui/theme';

export interface TextProps extends RNTextProps {
  variant?: TypeRoleName;
  /** Semantic colour from the palette. Defaults to ink. */
  color?: keyof Palette;
  align?: 'left' | 'center' | 'right';
}

/**
 * The only way text is rendered in Kati.
 *
 * Dynamic Type is applied here by hand rather than through RN's
 * `allowFontScaling` + `maxFontSizeMultiplier`, because on this RN version the
 * pair measures the line box at the capped size but draws the glyphs at the
 * device size — text clips at accessibility sizes. Scaling fontSize,
 * lineHeight and letterSpacing together from `fontScale` is deterministic and
 * cannot disagree with itself.
 */
export function Text({ variant = 'body', color = 'ink', align, style, ...rest }: TextProps) {
  const theme = useTheme();
  const { fontScale } = useWindowDimensions();
  const { maxScale, fontSize, lineHeight, letterSpacing, ...roleStyle }: TypeRole =
    theme.type[variant];
  const k = Math.min(fontScale, maxScale);

  return (
    <RNText
      allowFontScaling={false}
      {...rest}
      style={[
        roleStyle,
        {
          fontSize: fontSize * k,
          lineHeight: lineHeight * k,
          letterSpacing: (letterSpacing ?? 0) * k,
          color: theme.colors[color],
        },
        align && { textAlign: align },
        style,
      ]}
    />
  );
}
