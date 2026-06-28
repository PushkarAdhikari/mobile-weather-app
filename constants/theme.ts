export const theme = {
  colors: {
    white: '#FFFFFF',
    glass: {
      bg: 'rgba(255,255,255,0.07)',
      border: 'rgba(255,255,255,0.12)',
      borderLight: 'rgba(255,255,255,0.25)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255,255,255,0.72)',
      tertiary: 'rgba(255,255,255,0.48)',
      muted: 'rgba(255,255,255,0.28)',
    },
    accent: '#4facfe',
    accentGradient: ['#4facfe', '#00f2fe'] as const,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 48,
  },
  typography: {
    caption: 12,
    body: 14,
    bodyLg: 16,
    heading: 18,
    title: 24,
    display: 32,
    hero: 72,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 999,
  },
} as const;
