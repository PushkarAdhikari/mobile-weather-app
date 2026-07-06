import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

const PARTICLE_COUNT = 8;

function SunScene({ size }: { size: number }) {
  const rotation = useSharedValue(0);
  const glow = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 30000, easing: Easing.linear }), -1);
    glow.value = withRepeat(withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, []);

  const rotStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.1 + glow.value * 0.08,
    transform: [{ scale: 1 + glow.value * 0.05 }],
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[{ position: 'absolute', width: size * 1.3, height: size * 1.3, borderRadius: size * 0.65, backgroundColor: '#FBBF24' }, glowStyle]} />
      <Animated.View style={rotStyle}>
        <MaterialCommunityIcons name="weather-sunny" size={size * 0.65} color="#FBBF24" />
      </Animated.View>
    </View>
  );
}

function CloudScene({ size }: { size: number }) {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, []);

  const driftStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: drift.value * 8 }],
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={driftStyle}>
        <MaterialCommunityIcons name="weather-cloudy" size={size * 0.65} color="#94A3B8" />
      </Animated.View>
    </View>
  );
}

function NightScene({ size }: { size: number }) {
  const twinkle = useSharedValue(0);

  useEffect(() => {
    twinkle.value = withRepeat(withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, []);

  const moonStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${twinkle.value * 15}deg` }],
  }));

  const starStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + twinkle.value * 0.7,
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={moonStyle}>
        <MaterialCommunityIcons name="weather-night" size={size * 0.55} color="#CBD5E1" />
      </Animated.View>
      <Animated.View style={[{ position: 'absolute', top: size * 0.08, right: size * 0.12 }, starStyle]}>
        <Ionicons name="star" size={size * 0.08} color="#FBBF24" />
      </Animated.View>
      <Animated.View style={[{ position: 'absolute', top: size * 0.2, left: size * 0.08 }, starStyle]}>
        <Ionicons name="star" size={size * 0.06} color="#FBBF24" />
      </Animated.View>
      <Animated.View style={[{ position: 'absolute', bottom: size * 0.15, right: size * 0.05 }, starStyle]}>
        <Ionicons name="star" size={size * 0.05} color="#FBBF24" />
      </Animated.View>
    </View>
  );
}

function RainDrop({ index, size }: { index: number; size: number }) {
  const fall = useSharedValue(0);
  useEffect(() => {
    fall.value = withRepeat(
      withSequence(withTiming(1, { duration: 600 + index * 100, easing: Easing.linear }), withTiming(0, { duration: 0 })),
      -1
    );
  }, []);
  const fallStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: fall.value * size * 0.2 }],
    opacity: 1 - fall.value * 0.6,
  }));
  return <Animated.View style={[{ width: 2, height: size * 0.12, borderRadius: 1, backgroundColor: 'rgba(96,165,250,0.5)' }, fallStyle]} />;
}

function RainScene({ size }: { size: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <MaterialCommunityIcons name="weather-pouring" size={size * 0.6} color="#60A5FA" />
      <View style={{ position: 'absolute', bottom: size * 0.15, flexDirection: 'row', gap: size * 0.08 }}>
        {Array.from({ length: 5 }).map((_, i) => <RainDrop key={i} index={i} size={size} />)}
      </View>
    </View>
  );
}

function SnowFlake({ index, size }: { index: number; size: number }) {
  const fall = useSharedValue(0);
  useEffect(() => {
    fall.value = withRepeat(
      withSequence(withTiming(1, { duration: 1500 + index * 200, easing: Easing.linear }), withTiming(0, { duration: 0 })),
      -1
    );
  }, []);
  const fallStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: fall.value * size * 0.25 }],
    opacity: 1 - fall.value * 0.5,
  }));
  return <Animated.View style={[{ width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.7)' }, fallStyle]} />;
}

function SnowScene({ size }: { size: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <MaterialCommunityIcons name="weather-snowy" size={size * 0.6} color="#E2E8F0" />
      <View style={{ position: 'absolute', flexDirection: 'row', gap: size * 0.12, top: size * 0.05 }}>
        {Array.from({ length: 4 }).map((_, i) => <SnowFlake key={i} index={i} size={size} />)}
      </View>
    </View>
  );
}

function StormScene({ size }: { size: number }) {
  const flash = useSharedValue(0);

  useEffect(() => {
    flash.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0, { duration: 50 }),
        withTiming(0.5, { duration: 80 }),
        withTiming(0, { duration: 200 }),
        withTiming(0, { duration: 3000 }),
      ),
      -1
    );
  }, []);

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flash.value * 0.15,
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <MaterialCommunityIcons name="weather-lightning" size={size * 0.6} color="#818CF8" />
      <Animated.View style={[{ position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: '#FFF' }, flashStyle]} />
    </View>
  );
}

function FogScene({ size }: { size: number }) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + pulse.value * 0.2,
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={pulseStyle}>
        <MaterialCommunityIcons name="weather-fog" size={size * 0.6} color="#94A3B8" />
      </Animated.View>
    </View>
  );
}

function getSceneType(code: number, isDay: number): string {
  if (!isDay && (code === 1000 || code === 1003)) return 'night';
  if (code === 1000) return 'sun';
  if (code >= 1003 && code <= 1009) return 'cloud';
  if (code >= 1030 && code <= 1035) return 'fog';
  if (code >= 1063 && code <= 1171) return 'rain';
  if (code >= 1198 && code <= 1201) return 'rain';
  if (code >= 1240 && code <= 1246) return 'rain';
  if (code >= 1213 && code <= 1237) return 'snow';
  if (code >= 1249 && code <= 1264) return 'snow';
  if (code >= 1273 && code <= 1282) return 'storm';
  return 'sun';
}

export function WeatherScene({ code, isDay, size = 140 }: { code: number; isDay: number; size?: number }) {
  const type = getSceneType(code, isDay);

  switch (type) {
    case 'night': return <NightScene size={size} />;
    case 'sun': return <SunScene size={size} />;
    case 'cloud': return <CloudScene size={size} />;
    case 'fog': return <FogScene size={size} />;
    case 'rain': return <RainScene size={size} />;
    case 'snow': return <SnowScene size={size} />;
    case 'storm': return <StormScene size={size} />;
    default: return <SunScene size={size} />;
  }
}
