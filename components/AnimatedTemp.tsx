import { Text, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';

interface AnimatedTempProps {
  value: number;
  unit: string;
  fontSize?: number;
}

export function AnimatedTemp({ value, unit, fontSize = 64 }: AnimatedTempProps) {
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
    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
      <Animated.Text
        style={[
          {
            fontSize,
            fontWeight: '700',
            color: '#FFFFFF',
            letterSpacing: -2,
          },
          animatedStyle,
        ]}
      >
        {value}°
      </Animated.Text>
      <Text style={{ fontSize: fontSize * 0.35, fontWeight: '300', color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>
        {unit}
      </Text>
    </View>
  );
}
