import { useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSequence } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { getWeatherGradient, shiftGradient, shiftHex } from '../utils/weather';
import { getThemeColors } from '../constants/theme';
import { WeatherEffects } from './WeatherEffects';

interface GradientBackgroundProps {
  isDay: number;
  weatherCode: number;
  theme: 'dark' | 'light';
  children: React.ReactNode;
}

function DepthCircle({ size, top, left, color }: { size: number; top: number; left: number; color: string }) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const rx = useRef(Math.random() * 30 + 20).current;
  const ry = useRef(Math.random() * 20 + 15).current;
  const dx = useRef(Math.random() * 6000 + 4000).current;
  const dy = useRef(Math.random() * 6000 + 4000).current;

  useEffect(() => {
    tx.value = withRepeat(
      withSequence(
        withTiming(rx, { duration: dx, easing: Easing.inOut(Easing.sin) }),
        withTiming(-rx, { duration: dx, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: dx, easing: Easing.inOut(Easing.sin) }),
      ),
      -1
    );
    ty.value = withRepeat(
      withSequence(
        withTiming(-ry, { duration: dy, easing: Easing.inOut(Easing.sin) }),
        withTiming(ry, { duration: dy, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: dy, easing: Easing.inOut(Easing.sin) }),
      ),
      -1
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute', top, left,
          width: size, height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: 0.08,
        },
        animatedStyle,
      ]}
    />
  );
}

export function GradientBackground({ isDay, weatherCode, theme, children }: GradientBackgroundProps) {
  if (theme === 'light') {
    return <LightGradient isDay={isDay} weatherCode={weatherCode}>{children}</LightGradient>;
  }
  return <DarkGradient isDay={isDay} weatherCode={weatherCode}>{children}</DarkGradient>;
}

function LightGradient({ isDay, weatherCode, children }: { isDay: number; weatherCode: number; children: React.ReactNode }) {
  const colors = getThemeColors('light');
  const gradient = useMemo(() => getWeatherGradient(isDay, weatherCode).map(c => `${c}40`) as [string, string], [isDay, weatherCode]);
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />
      <WeatherEffects weatherCode={weatherCode} isDay={isDay} />
      {children}
    </View>
  );
}

function DarkGradient({ isDay, weatherCode, children }: { isDay: number; weatherCode: number; children: React.ReactNode }) {
  const colors = getThemeColors('dark');

  const gradient = useMemo(() => getWeatherGradient(isDay, weatherCode), [isDay, weatherCode]);
  const shifted = useMemo(() => shiftGradient(gradient, 20), [gradient]);

  const overlayOpacity = useSharedValue(0);
  const overlayScale = useSharedValue(1);

  useEffect(() => {
    overlayOpacity.value = 0;
    overlayScale.value = 1;
    overlayOpacity.value = withRepeat(
      withTiming(1, { duration: 12000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    overlayScale.value = withRepeat(
      withTiming(1.05, { duration: 20000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [gradient]);

  const animatedOverlay = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value * 0.3,
    transform: [{ scale: overlayScale.value }],
  }));

  const circles = useMemo(() => [
    { size: 250, top: -60, left: -80, color: gradient[0] },
    { size: 200, top: 200, left: 120, color: gradient[1] },
    { size: 180, top: 400, left: -40, color: shiftHex(gradient[0], 15) },
  ], [gradient]);

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />
      <Animated.View style={[StyleSheet.absoluteFill, animatedOverlay]}>
        <LinearGradient colors={shifted} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      </Animated.View>
      {circles.map((c, i) => (
        <DepthCircle key={i} size={c.size} top={c.top} left={c.left} color={c.color} />
      ))}
      <WeatherEffects weatherCode={weatherCode} isDay={isDay} />
      {children}
    </View>
  );
}
