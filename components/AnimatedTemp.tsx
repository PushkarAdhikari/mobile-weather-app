import { Text, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import { theme, ThemeColors } from '../constants/theme';

interface AnimatedTempProps {
  value: number;
  unit: string;
  fontSize?: number;
  colors: ThemeColors;
}

export function AnimatedTemp({ value, unit, fontSize = 72, colors }: AnimatedTempProps) {
  const scale = useSharedValue(1.3);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = 1.3;
    opacity.value = 0;
    scale.value = withSpring(1, { damping: 15, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 200 });
  }, [value, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: theme.spacing.sm }}>
      <Animated.Text
        style={[
          {
            fontSize,
            fontWeight: '700',
            color: colors.text.primary,
            letterSpacing: -3,
          },
          animatedStyle,
        ]}
      >
        {value}°
      </Animated.Text>
      <Text style={{ fontSize: fontSize * 0.35, fontWeight: '300', color: colors.text.tertiary, marginTop: theme.spacing.sm }}>
        {unit}
      </Text>
    </View>
  );
}
