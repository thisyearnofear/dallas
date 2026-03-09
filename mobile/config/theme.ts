// Design tokens — single source of truth for all visual decisions
export const Colors = {
  // Brand
  accent: '#00ff88',
  accentDim: '#00cc6a',
  accentMuted: 'rgba(0, 255, 136, 0.12)',
  accentBorder: 'rgba(0, 255, 136, 0.25)',

  // Backgrounds
  bg: '#080808',
  bgCard: '#111111',
  bgElevated: '#161616',
  bgInput: '#0e0e0e',

  // Borders
  border: '#1e1e1e',
  borderSubtle: '#141414',

  // Text
  textPrimary: '#f0f0f0',
  textSecondary: '#888888',
  textMuted: '#444444',
  textAccent: '#00ff88',

  // Status
  success: '#00ff88',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Alliance tier colors
  tier1: '#00ff88', // top TVL
  tier2: '#3b82f6',
  tier3: '#8b5cf6',
  tier4: '#f59e0b',
};

export const Typography = {
  // Sizes
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 30,
  xxxl: 38,

  // Weights
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  black: '900' as const,

  // Families
  mono: 'monospace' as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const Shadow = {
  accent: {
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
};
