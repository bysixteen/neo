/**
 * Token values from the Figma Primitive and Semantic Scale collections.
 * Source of truth: .context/plans/radius-tokens-for-amazon-project-12px-grid.md
 */

// --- Primitive Scale ---

export const space = {
  0: 0,
  4: 4,
  8: 8,
  12: 12,
  16: 16,
  24: 24,
  36: 36,
  48: 48,
  60: 60,
  72: 72,
  96: 96,
  120: 120,
} as const;

export const radii = {
  6: 6,
  12: 12,
  24: 24,
  36: 36,
  40: 40,
  48: 48,
  80: 80,
  96: 96,
  999: 999,
} as const;

// --- Semantic Scale ---

export const spacing = {
  none: space[0],
  connected: space[8],
  unconnected: space[16],
  xs: space[4],
  sm: space[12],
  md: space[24],
  lg: space[36],
  xl: space[48],
  '2xl': space[60],
  '3xl': space[72],
  '4xl': space[96],
  '5xl': space[120],
} as const;

export const semanticRadii = {
  none: 0,
  small: radii[24],
  connected: radii[40],
  medium: radii[48],
  large: radii[80],
  xlarge: radii[96],
  pill: radii[999],
} as const;

// --- Grid ---

export const grid = {
  base: 4,
  structural: 12,
  compositional: 36,
} as const;

export const canvas = {
  width: 1440,
  height: 900,
} as const;
