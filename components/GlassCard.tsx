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
          backgroundColor: 'rgba(255,255,255,0.04)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.08)',
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
