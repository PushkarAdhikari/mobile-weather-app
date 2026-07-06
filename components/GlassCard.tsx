import { View, ViewProps } from 'react-native';
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
          borderWidth: 1,
          borderColor: colors.surfaceBorder,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
