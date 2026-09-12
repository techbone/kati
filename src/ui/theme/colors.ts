/**
 * Kati palette.
 *
 * Warm-neutral ground, a deep clinic green as the single brand colour, and
 * four status colours that carry meaning on their own — a parent must be able
 * to read "overdue" from the colour before they read the word.
 *
 * Status colours are semantic and never reused for decoration.
 *
 * Every text colour clears WCAG AA (4.5:1) on the surface it's used on, in
 * both schemes. Checked numerically, not by eye — inkSoft in particular was
 * 2.9:1 before and it's what every caption and disclaimer uses.
 */
export interface Palette {
  // grounds
  bg: string;
  surface: string;
  surfaceMuted: string;
  line: string;
  // text
  ink: string;
  inkMuted: string;
  inkSoft: string;
  // brand
  primary: string;
  primarySoft: string;
  onPrimary: string;
  // status
  given: string;
  givenSoft: string;
  due: string;
  dueSoft: string;
  overdue: string;
  overdueSoft: string;
  upcoming: string;
  upcomingSoft: string;
  skipped: string;
  skippedSoft: string;
  // misc
  danger: string;
  overlay: string;
}

export const light: Palette = {
  bg: '#F6F5F1',
  surface: '#FFFFFF',
  surfaceMuted: '#EEEDE8',
  line: '#E3E1DA',

  ink: '#1C1B18',
  inkMuted: '#6B6860',
  inkSoft: '#6F6C65',

  primary: '#1F5F4A',
  primarySoft: '#DDEDE5',
  onPrimary: '#FFFFFF',

  given: '#256B4E',
  givenSoft: '#DCF0E6',
  due: '#985109',
  dueSoft: '#FBEBD3',
  overdue: '#B83A2E',
  overdueSoft: '#F9E1DD',
  upcoming: '#6B6860',
  upcomingSoft: '#EEEDE8',
  skipped: '#6B6860',
  skippedSoft: '#F0EFEA',

  danger: '#B83A2E',
  overlay: 'rgba(28, 27, 24, 0.45)',
};

export const dark: Palette = {
  bg: '#131311',
  surface: '#1D1D1A',
  surfaceMuted: '#262622',
  line: '#2F2E29',

  ink: '#F1EFE9',
  inkMuted: '#A8A59B',
  inkSoft: '#8F8C83',

  primary: '#5FBF9A',
  primarySoft: '#183A2E',
  onPrimary: '#0E1F18',

  given: '#5FBF9A',
  givenSoft: '#173628',
  due: '#E8A050',
  dueSoft: '#3A2A12',
  overdue: '#EE7A6D',
  overdueSoft: '#3B1E1A',
  upcoming: '#A8A59B',
  upcomingSoft: '#262622',
  skipped: '#8F8C83',
  skippedSoft: '#22221F',

  danger: '#EE7A6D',
  overlay: 'rgba(0, 0, 0, 0.6)',
};
