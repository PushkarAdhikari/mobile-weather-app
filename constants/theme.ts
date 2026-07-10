const baseLight = {
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
};

const baseDark = {
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
};

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceBorder: string;
  surfaceBorderLight: string;
  text: { primary: string; secondary: string; tertiary: string; muted: string };
  accent: string;
  accentGradient: readonly [string, string];
}

function getWeatherAccent(isDay: boolean, code: number): { accent: string; accentGradient: [string, string] } {
  if (!isDay) return { accent: '#818CF8', accentGradient: ['#4C1D95', '#818CF8'] };
  if (code >= 1000 && code <= 1003) return { accent: '#4FACFE', accentGradient: ['#4FACFE', '#00F2FE'] };
  if (code >= 1004 && code <= 1009) return { accent: '#94A3B8', accentGradient: ['#64748B', '#94A3B8'] };
  if (code >= 1030 && code <= 1035) return { accent: '#8B9DC3', accentGradient: ['#6366F1', '#8B9DC3'] };
  if (code >= 1063 && code <= 1171) return { accent: '#60A5FA', accentGradient: ['#3B82F6', '#60A5FA'] };
  if (code >= 1201 && code <= 1237) return { accent: '#C084FC', accentGradient: ['#7C3AED', '#C084FC'] };
  if (code >= 1240 && code <= 1246) return { accent: '#38BDF8', accentGradient: ['#0284C7', '#38BDF8'] };
  if (code >= 1249 && code <= 1264) return { accent: '#E2E8F0', accentGradient: ['#A0AEC0', '#E2E8F0'] };
  if (code >= 1273 && code <= 1282) return { accent: '#A78BFA', accentGradient: ['#6D28D9', '#A78BFA'] };
  return { accent: '#4FACFE', accentGradient: ['#4FACFE', '#00F2FE'] };
}

type ThemeSpacing = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
  huge: number;
};

type ThemeTypography = {
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
  colors: baseDark,
  spacing,
  typography,
  radius,
};

export function getThemeColors(mode: 'dark' | 'light', weatherCode?: number, isDay?: number): ThemeColors {
  const base = mode === 'light' ? baseLight : baseDark;
  if (weatherCode === undefined || isDay === undefined) return base;
  const { accent, accentGradient } = getWeatherAccent(isDay === 1, weatherCode);
  return { ...base, accent, accentGradient };
}

type ThemeMode = 'dark' | 'light';
