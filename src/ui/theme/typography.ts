/**
 * Type scale.
 *
 * Display and title use Fraunces — a warm serif that makes a child's name and
 * a due date feel like they belong on a record, not a dashboard. Everything
 * else is the system font: it's what iOS Dynamic Type is tuned for, it costs
 * nothing, and it keeps the UI feeling native.
 *
 * Sizes are base values. React Native scales them with the user's Dynamic
 * Type setting automatically; `maxScale` caps how far a role may grow so a
 * 34pt display at the largest accessibility size doesn't blow out a layout.
 */
import type { TextStyle } from 'react-native';

export const fontFamily = {
  display: 'Fraunces_600SemiBold',
  displayRegular: 'Fraunces_400Regular',
  // undefined = platform system font (SF Pro on iOS)
  body: undefined,
} as const;

export interface TypeRole {
  fontFamily?: string;
  fontSize: number;
  lineHeight: number;
  fontWeight?: TextStyle['fontWeight'];
  letterSpacing?: number;
  textTransform?: TextStyle['textTransform'];
  /** Dynamic Type ceiling for this role. */
  maxScale: number;
}

export const type = {
  display: {
    fontFamily: fontFamily.display,
    fontSize: 34,
    lineHeight: 41,
    letterSpacing: -0.4,
    maxScale: 1.3,
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.2,
    maxScale: 1.4,
  },
  heading: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '600',
    letterSpacing: -0.2,
    maxScale: 1.6,
  },
  body: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '400',
    maxScale: 2,
  },
  bodyStrong: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '600',
    maxScale: 2,
  },
  callout: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
    maxScale: 2,
  },
  caption: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '400',
    maxScale: 2,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    maxScale: 1.6,
  },
} as const satisfies Record<string, TypeRole>;

export type TypeRoleName = keyof typeof type;
