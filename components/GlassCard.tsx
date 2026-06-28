import { View, ViewProps, StyleSheet } from 'react-native';

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
}

export function GlassCard({ children, style, ...props }: GlassCardProps) {
  return (
    <View
      style={[
        {
          borderRadius: 20,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: 'rgba(255, 255, 255, 0.15)',
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
