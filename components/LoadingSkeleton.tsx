import { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import { GlassCard } from './GlassCard';
import { theme, ThemeColors } from '../constants/theme';

function SkeletonBlock({ width, height, borderRadius = 8, colors }: { width?: number; height?: number; borderRadius?: number; colors: ThemeColors }) {
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
        backgroundColor: colors.surface,
        opacity,
      }}
    />
  );
}

export function LoadingSkeleton({ colors }: { colors: ThemeColors }) {
  return (
    <View style={{ flex: 1, padding: theme.spacing.xxl, gap: theme.spacing.xxl }}>
      <View style={{ alignItems: 'center', gap: theme.spacing.xl, marginTop: theme.spacing.huge }}>
        <SkeletonBlock width={140} height={24} colors={colors} />
        <SkeletonBlock width={200} height={90} borderRadius={45} colors={colors} />
        <SkeletonBlock width={120} height={18} colors={colors} />
      </View>

      <View style={{ flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.xxl }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <GlassCard key={i} colors={colors} style={{ flex: 1, padding: theme.spacing.xl, alignItems: 'center', gap: theme.spacing.sm }}>
            <SkeletonBlock width={32} height={32} borderRadius={16} colors={colors} />
            <SkeletonBlock width={40} height={12} colors={colors} />
            <SkeletonBlock width={32} height={20} colors={colors} />
          </GlassCard>
        ))}
      </View>

      <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.xxl }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <GlassCard key={i} colors={colors} style={{ padding: theme.spacing.xl, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.lg }}>
            <SkeletonBlock width={44} height={44} borderRadius={22} colors={colors} />
            <View style={{ flex: 1, gap: theme.spacing.sm }}>
              <SkeletonBlock width={100} height={16} colors={colors} />
              <SkeletonBlock width={140} height={14} colors={colors} />
            </View>
            <SkeletonBlock width={56} height={22} colors={colors} />
          </GlassCard>
        ))}
      </View>
    </View>
  );
}
