import { useEffect, useRef, useMemo } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Effect = 'sun' | 'cloud' | 'cloudy' | 'fog' | 'rain' | 'heavy-rain' | 'snow' | 'storm' | null;

function getEffect(code: number, isDay: number): Effect {
  if (!isDay && code === 1000) return null;
  if (code === 1000) return 'sun';
  if (code === 1003) return 'cloud';
  if (code === 1006 || code === 1009) return 'cloudy';
  if (code >= 1030 && code <= 1035) return 'fog';
  if (code >= 1063 && code <= 1171) return 'rain';
  if (code >= 1198 && code <= 1201) return 'rain';
  if (code >= 1240 && code <= 1246) return 'heavy-rain';
  if (code >= 1213 && code <= 1237) return 'snow';
  if (code >= 1249 && code <= 1264) return 'snow';
  if (code >= 1273 && code <= 1282) return 'storm';
  return null;
}

const H = 1000;
const W = 400;

function rand(min: number, max: number) { return Math.random() * (max - min) + min; }

function useParticleAnim(duration: number, delay: number) {
  const y = useRef(new Animated.Value(-rand(5, 60))).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  const start = () => {
    y.setValue(-rand(5, 60));
    animRef.current = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(y, { toValue: H + 40, duration, easing: Easing.linear, useNativeDriver: true }),
      ])
    );
    animRef.current.start();
  };

  const stop = () => { animRef.current?.stop(); };

  return { y, start, stop };
}

function RainDrop({ x, delay, duration, intensity }: { x: number; delay: number; duration: number; intensity: number }) {
  const { y, start, stop } = useParticleAnim(duration, delay);

  useEffect(() => { start(); return stop; }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute', left: x, width: 1.5, height: 8 + intensity * 4,
        backgroundColor: `rgba(255,255,255,${0.1 + intensity * 0.15})`,
        borderRadius: 1, transform: [{ translateY: y }, { rotate: '12deg' }],
      }}
    />
  );
}

function Rain({ count, intensity }: { count: number; intensity: number }) {
  const drops = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      key: i, x: rand(0, W), delay: rand(0, 2000), duration: rand(600, 1200) / (intensity + 0.5),
    })), [count, intensity]);
  return <>{drops.map(({ key: k, ...d }) => <RainDrop key={k} {...d} intensity={intensity} />)}</>;
}

function SnowFlake({ x, delay }: { x: number; delay: number }) {
  const y = useRef(new Animated.Value(-rand(5, 60))).current;
  const sway = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    y.setValue(-rand(5, 60));
    const dur = rand(3000, 5000);
    const anim = Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(y, { toValue: H + 30, duration: dur, easing: Easing.linear, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(sway, { toValue: 1, duration: dur / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(sway, { toValue: -1, duration: dur / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(sway, { toValue: 0, duration: dur / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ]),
    ]));
    anim.start();
    return () => anim.stop();
  }, []);

  const size = rand(2, 5);
  return (
    <Animated.View
      style={{
        position: 'absolute', left: x - size / 2, width: size, height: size,
        borderRadius: size / 2, backgroundColor: 'rgba(255,255,255,0.5)',
        transform: [{ translateY: y }, { translateX: Animated.multiply(sway, 20) }],
      }}
    />
  );
}

function Snow() {
  const flakes = useMemo(() =>
    Array.from({ length: 25 }, (_, i) => ({ key: i, x: rand(0, W), delay: rand(0, 3000) })),
    []);
  return <>{flakes.map(({ key: k, ...f }) => <SnowFlake key={k} x={f.x} delay={f.delay} />)}</>;
}

function Cloud({ x, size, speed }: { x: number; size: number; speed: number }) {
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    translateX.setValue(-size);
    const anim = Animated.loop(
      Animated.timing(translateX, { toValue: W + size, duration: 15000 / speed, easing: Easing.linear, useNativeDriver: true })
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute', top: 60 + x, left: 0,
        transform: [{ translateX }],
      }}
    >
      <Ionicons name="cloud" size={size} color="rgba(255,255,255,0.07)" />
    </Animated.View>
  );
}

function Clouds() {
  const clouds = useMemo(() =>
    Array.from({ length: 3 }, (_, i) => ({ key: i, x: rand(0, 200), size: rand(60, 100), speed: rand(0.5, 1.5) })),
    []);
  return <>{clouds.map(({ key: k, ...c }) => <Cloud key={k} {...c} />)}</>;
}

function MistBand({ top, width }: { top: number; width: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(-width)).current;

  useEffect(() => {
    opacity.setValue(0);
    translateX.setValue(-width);
    const anim = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.15, duration: 3000, easing: Easing.in(Easing.ease), useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 3000, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        ]),
        Animated.timing(translateX, { toValue: W, duration: 10000, easing: Easing.linear, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute', top, left: 0, width, height: 20,
        borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)',
        opacity, transform: [{ translateX }],
      }}
    />
  );
}

function Fog() {
  const bands = useMemo(() =>
    Array.from({ length: 4 }, (_, i) => ({ key: i, top: rand(80, 500), width: rand(200, 350) })),
    []);
  return <>{bands.map(({ key: k, ...b }) => <MistBand key={k} {...b} />)}</>;
}

function SunGlow() {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.6, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);

  const size = 200;
  return (
    <Animated.View
      style={{
        position: 'absolute', top: -40, right: -40, width: size, height: size,
        borderRadius: size / 2, backgroundColor: 'rgba(255,200,50,0.08)',
        opacity: pulse,
      }}
    />
  );
}

function Flash() {
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const flash = () => {
      opacity.setValue(0.3);
      Animated.timing(opacity, { toValue: 0, duration: 200, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();
      timerRef.current = setTimeout(flash, rand(2000, 6000));
    };
    const t = setTimeout(flash, rand(1000, 4000));
    return () => { clearTimeout(t); if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        ...StyleSheet.absoluteFillObject, backgroundColor: '#FFFFFF',
        opacity,
      }}
    />
  );
}

function Storm() {
  return (
    <>
      <Rain count={30} intensity={1} />
      <Flash />
    </>
  );
}

export function WeatherEffects({ weatherCode, isDay }: { weatherCode: number; isDay: number }) {
  const effect = getEffect(weatherCode, isDay);
  if (!effect) return null;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: H }} pointerEvents="none">
      {effect === 'sun' && <SunGlow />}
      {effect === 'cloud' && <><SunGlow /><Clouds /></>}
      {effect === 'cloudy' && <Clouds />}
      {effect === 'fog' && <Fog />}
      {effect === 'rain' && <Rain count={25} intensity={0.6} />}
      {effect === 'heavy-rain' && <Rain count={35} intensity={1} />}
      {effect === 'snow' && <Snow />}
      {effect === 'storm' && <Storm />}
    </View>
  );
}
