import { View } from 'react-native';
import { GlassCard } from './GlassCard';

function SkeletonBlock({ width, height, borderRadius = 8 }: { width?: number; height?: number; borderRadius?: number }) {
  return (
    <View
      style={{
        width: width || '100%',
        height: height || 20,
        borderRadius,
        backgroundColor: 'rgba(255,255,255,0.1)',
      }}
    />
  );
}

export function LoadingSkeleton() {
  return (
    <View style={{ flex: 1, padding: 24, gap: 24 }}>
      <View style={{ alignItems: 'center', gap: 16, marginTop: 48 }}>
        <SkeletonBlock width={120} height={24} />
        <SkeletonBlock width={180} height={80} borderRadius={40} />
        <SkeletonBlock width={100} height={16} />
      </View>

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <GlassCard key={i} style={{ flex: 1, padding: 16, alignItems: 'center', gap: 8 }}>
            <SkeletonBlock width={32} height={32} borderRadius={16} />
            <SkeletonBlock width={40} height={14} />
            <SkeletonBlock width={30} height={20} />
          </GlassCard>
        ))}
      </View>

      <View style={{ gap: 12, marginTop: 16 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <GlassCard key={i} style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <SkeletonBlock width={40} height={40} borderRadius={20} />
            <View style={{ flex: 1, gap: 8 }}>
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
