/** 4-point spacing scale. Use these, never raw numbers, so rhythm stays consistent. */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

/** Standard horizontal gutter for screen content. */
export const gutter = space.lg;

/** Minimum tappable size per Apple HIG. */
export const hitSize = 44;
