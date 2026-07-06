export const lightColors = {
  background: '#f0f4f8',
  surface: 'rgba(255,255,255,0.4)',
  surfaceBorder: 'rgba(0,0,0,0.06)',
  surfaceBorderLight: 'rgba(255,255,255,0.3)',
  text: {
    primary: '#0f172a',
    secondary: 'rgba(15,23,42,0.72)',
    tertiary: 'rgba(15,23,42,0.48)',
    muted: 'rgba(15,23,42,0.28)',
  },
  accent: '#4facfe',
  accentGradient: ['#4facfe', '#00f2fe'] as const,
} as const;

export const darkColors = {
  background: '#0f172a',
  surface: 'rgba(255,255,255,0.04)',
  surfaceBorder: 'rgba(255,255,255,0.08)',
  surfaceBorderLight: 'rgba(255,255,255,0.12)',
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255,255,255,0.72)',
    tertiary: 'rgba(255,255,255,0.48)',
    muted: 'rgba(255,255,255,0.28)',
  },
  accent: '#4facfe',
  accentGradient: ['#4facfe', '#00f2fe'] as const,
} as const;

export type ThemeColors = typeof darkColors;

export type ThemeSpacing = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
  huge: number;
};

export type ThemeTypography = {
  caption: number;
  body: number;
  bodyLg: number;
  heading: number;
  section: number;
  title: number;
  display: number;
  hero: number;
};

export const spacing: ThemeSpacing = {
  xs: 4,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 56,
} as const;

export const typography: ThemeTypography = {
  caption: 12,
  body: 15,
  bodyLg: 17,
  heading: 20,
  section: 13,
  title: 28,
  display: 36,
  hero: 80,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

// Backward-compatible theme object (defaults to dark mode)
export const theme = {
  colors: darkColors,
  spacing,
  typography,
  radius,
} as const;

export function getThemeColors(mode: 'dark' | 'light'): ThemeColors {
  return mode === 'light' ? (lightColors as unknown as ThemeColors) : darkColors;
}

export type ThemeMode = 'dark' | 'light';
