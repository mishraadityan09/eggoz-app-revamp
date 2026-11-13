/**
 * Design tokens. Brand values were sampled from the Eggoz app; where an original
 * failed WCAG AA contrast (finding U15) an accessible variant is used for text.
 * Contrast notes are against the background each token is meant for.
 */
export const colors = {
  // Brand
  brandHeader: '#F7B045', // header fill — text on it must be inkPrimary or headerInkMuted
  brandOrange: '#FF8C66', // fills / illustration only — never with white text (2.28:1)
  brandOrangeStrong: '#C2410C', // primary buttons (white text 5.18:1), links, "Add"
  brandCream: '#FDF8E9', // splash, onboarding
  brandYolk: '#F59E0B', // illustration only

  // Surfaces
  surfacePage: '#F5F7FA',
  surfaceCard: '#FFFFFF',
  border: '#EBEBEB',
  borderStrong: '#D6D3D1',
  overlay: 'rgba(26,26,26,0.45)',

  // Text
  inkPrimary: '#1A1A1A', // 9.3:1 on header, 17:1 on white
  inkSecondary: '#6B6B6B', // 5.33:1 on white, 5.0:1 on cream
  inkPlaceholder: '#767676', // 4.54:1 on white
  inkOnPrimary: '#FFFFFF',
  headerInkMuted: '#4D3A12', // 5.83:1 on brandHeader

  // Semantic
  accentSubscribe: '#2B7387', // 5.38:1 on white
  rewardBg: '#FCF8E1',
  rewardInk: '#8A6512', // 4.97:1 on rewardBg
  discount: '#C2410C',
  success: '#166534',
  successBg: '#DCFCE7',
  danger: '#B91C1C',
  dangerBg: '#FEE2E2',

  // Loading
  skeleton: '#E9E4DA',
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const radius = { chip: 8, card: 12, sheet: 20, pill: 999 };

/** One width for containers (cards), one for every outlined control (buttons, chips, inputs). */
export const border = { hairline: 1, control: 1.5 };

export const fontSize = { caption: 12, body: 14, bodyLg: 16, title: 20, display: 28 };

export const fontWeight = { regular: '400', semibold: '600', bold: '700', heavy: '800' };

/** Minimum touch target (dp). */
export const touch = { min: 48 };
