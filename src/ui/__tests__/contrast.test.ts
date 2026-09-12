/**
 * WCAG AA contrast for every text colour on the surface it's actually used
 * on. Fails the build if a palette change drops a pair under 4.5:1.
 */
import { dark, light, type Palette } from '@/ui/theme/colors';

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

const AA = 4.5;

/** [foreground, background] pairs as the UI actually composes them. */
const PAIRS: [keyof Palette, keyof Palette][] = [
  ['ink', 'bg'],
  ['ink', 'surface'],
  ['inkMuted', 'bg'],
  ['inkMuted', 'surface'],
  ['inkMuted', 'surfaceMuted'],
  ['inkSoft', 'bg'],
  ['inkSoft', 'surface'],
  ['primary', 'primarySoft'],
  ['primary', 'surface'],
  ['onPrimary', 'primary'],
  ['given', 'givenSoft'],
  ['given', 'surface'],
  ['due', 'dueSoft'],
  ['due', 'surface'],
  ['overdue', 'overdueSoft'],
  ['overdue', 'surface'],
  ['upcoming', 'upcomingSoft'],
  ['skipped', 'skippedSoft'],
];

describe.each([
  ['light', light],
  ['dark', dark],
])('%s palette meets WCAG AA', (_name, palette) => {
  it.each(PAIRS)('%s on %s ≥ 4.5:1', (fg, bg) => {
    const ratio = contrast(palette[fg], palette[bg]);
    expect(ratio).toBeGreaterThanOrEqual(AA);
  });
});
