import { View, ViewProps, StyleSheet } from 'react-native';
import { theme, ThemeColors } from '../constants/theme';

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  colors: ThemeColors;
}

export function GlassCard({ children, style, colors, ...props }: GlassCardProps) {
  return (
    <View
      style={[
        {
          borderRadius: theme.radius.xl,
          backgroundColor: colors.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.surfaceBorder,
          borderTopColor: colors.surfaceBorderLight,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
