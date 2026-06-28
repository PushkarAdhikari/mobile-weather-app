import { View, ViewProps, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
}

export function GlassCard({ children, style, ...props }: GlassCardProps) {
  return (
    <View
      style={[
        {
          borderRadius: theme.radius.xl,
          backgroundColor: theme.colors.glass.bg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.glass.border,
          borderTopColor: theme.colors.glass.borderLight,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
