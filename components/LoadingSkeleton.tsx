import { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import { GlassCard } from './GlassCard';
import { theme } from '../constants/theme';

function SkeletonBlock({ width, height, borderRadius = 8 }: { width?: number; height?: number; borderRadius?: number }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={{
        width: width || '100%',
        height: height || 20,
        borderRadius,
        backgroundColor: 'rgba(255,255,255,0.1)',
        opacity,
      }}
    />
  );
}

export function LoadingSkeleton() {
  return (
    <View style={{ flex: 1, padding: theme.spacing.xxl, gap: theme.spacing.xxl }}>
      <View style={{ alignItems: 'center', gap: theme.spacing.lg, marginTop: theme.spacing.huge }}>
        <SkeletonBlock width={120} height={24} />
        <SkeletonBlock width={180} height={80} borderRadius={40} />
        <SkeletonBlock width={100} height={16} />
      </View>

      <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.xxl }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <GlassCard key={i} style={{ flex: 1, padding: theme.spacing.lg, alignItems: 'center', gap: theme.spacing.sm }}>
            <SkeletonBlock width={28} height={28} borderRadius={14} />
            <SkeletonBlock width={36} height={12} />
            <SkeletonBlock width={28} height={18} />
          </GlassCard>
        ))}
      </View>

      <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.lg }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <GlassCard key={i} style={{ padding: theme.spacing.lg, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.lg }}>
            <SkeletonBlock width={40} height={40} borderRadius={20} />
            <View style={{ flex: 1, gap: theme.spacing.sm }}>
              <SkeletonBlock width={80} height={14} />
              <SkeletonBlock width={120} height={12} />
            </View>
            <SkeletonBlock width={50} height={20} />
          </GlassCard>
        ))}
      </View>
    </View>
  );
}
