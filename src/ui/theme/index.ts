import { dark, light, type Palette } from './colors';
import { radius, space } from './spacing';
import { type } from './typography';

export interface Theme {
  scheme: 'light' | 'dark';
  colors: Palette;
  space: typeof space;
  radius: typeof radius;
  type: typeof type;
}

export const lightTheme: Theme = { scheme: 'light', colors: light, space, radius, type };
export const darkTheme: Theme = { scheme: 'dark', colors: dark, space, radius, type };

export { gutter, hitSize, radius, space } from './spacing';
export { fontFamily, type } from './typography';
export type { Palette } from './colors';
export type { TypeRole, TypeRoleName } from './typography';
