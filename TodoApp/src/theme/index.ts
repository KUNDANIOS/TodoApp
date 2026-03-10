// ============================================================
// src/theme/index.ts
// Design system: colors, typography, spacing, shadows
// ============================================================

export const Colors = {
  // Primary palette - deep navy/indigo
  primary: '#1E1B4B',       // Deep indigo
  primaryLight: '#312E81',
  primaryLighter: '#4338CA',
  accent: '#6366F1',        // Vibrant indigo
  accentLight: '#818CF8',

  // Secondary - coral/rose accent
  secondary: '#F43F5E',
  secondaryLight: '#FB7185',

  // Background layers
  background: '#0F0E1A',    // Near-black
  surface: '#1A1830',       // Card surface
  surfaceElevated: '#242140', // Elevated card
  surfaceBorder: '#2D2A50', // Borders

  // Semantic colors
  success: '#10B981',
  successLight: '#34D399',
  warning: '#F59E0B',
  warningLight: '#FCD34D',
  error: '#EF4444',
  errorLight: '#F87171',
  info: '#3B82F6',

  // Priority colors
  priorityCritical: '#FF3366',
  priorityHigh: '#FF6B35',
  priorityMedium: '#F59E0B',
  priorityLow: '#10B981',

  // Category colors
  categoryWork: '#6366F1',
  categoryPersonal: '#EC4899',
  categoryHealth: '#10B981',
  categoryFinance: '#F59E0B',
  categoryStudy: '#3B82F6',
  categoryShopping: '#8B5CF6',
  categoryOther: '#6B7280',

  // Text
  textPrimary: '#F1F0FF',
  textSecondary: '#A5A3C3',
  textMuted: '#6B6A8A',
  textDisabled: '#404060',

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(0,0,0,0.6)',
  shimmer: '#2D2A50',
};

export const Typography = {
  // Display
  displayXL: { fontSize: 48, fontWeight: '800' as const, letterSpacing: -1.5 },
  displayLG: { fontSize: 36, fontWeight: '800' as const, letterSpacing: -1 },
  displayMD: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },

  // Headings
  h1: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3 },
  h2: { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.2 },
  h3: { fontSize: 18, fontWeight: '600' as const },
  h4: { fontSize: 16, fontWeight: '600' as const },

  // Body
  bodyLG: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMD: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  bodySM: { fontSize: 12, fontWeight: '400' as const, lineHeight: 18 },

  // Labels & caps
  labelLG: { fontSize: 14, fontWeight: '600' as const, letterSpacing: 0.5 },
  labelMD: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.4 },
  labelSM: { fontSize: 10, fontWeight: '700' as const, letterSpacing: 1 },
  capsXS: { fontSize: 10, fontWeight: '700' as const, letterSpacing: 1.5, textTransform: 'uppercase' as const },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  giant: 64,
};

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  accent: {
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
};

/**
 * Priority badge color map
 */
export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'critical': return Colors.priorityCritical;
    case 'high': return Colors.priorityHigh;
    case 'medium': return Colors.priorityMedium;
    case 'low': return Colors.priorityLow;
    default: return Colors.textMuted;
  }
};

/**
 * Category color map
 */
export const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'work': return Colors.categoryWork;
    case 'personal': return Colors.categoryPersonal;
    case 'health': return Colors.categoryHealth;
    case 'finance': return Colors.categoryFinance;
    case 'study': return Colors.categoryStudy;
    case 'shopping': return Colors.categoryShopping;
    default: return Colors.categoryOther;
  }
};

export default { Colors, Typography, Spacing, Radius, Shadows };
