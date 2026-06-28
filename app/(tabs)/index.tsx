import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';

import { useWeather } from '../../hooks/useWeather';
import { useLocation } from '../../hooks/useLocation';
import { useAppContext } from '../../constants/AppContext';
import { DEFAULT_LOCATION } from '../../constants/api';
import { theme } from '../../constants/theme';
import { GradientBackground } from '../../components/GradientBackground';
import { GlassCard } from '../../components/GlassCard';
import { AnimatedTemp } from '../../components/AnimatedTemp';
import { WeatherIcon } from '../../components/WeatherIcon';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { ErrorState } from '../../components/ErrorState';
import { formatHourlyTime, formatTemp, formatWindSpeed } from '../../utils/weather';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { unit, selectedLocation } = useAppContext();
  const { location, loading: locLoading, cityName } = useLocation();

  const activeLat = selectedLocation?.lat ?? location?.lat ?? DEFAULT_LOCATION.lat;
  const activeLng = selectedLocation?.lng ?? location?.lng ?? DEFAULT_LOCATION.lng;

  const { data, isLoading, isError, error, refetch } = useWeather(activeLat, activeLng);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (locLoading || isLoading) return <LoadingSkeleton />;
  if (isError) return <ErrorState message={error?.message || 'Failed to load weather'} onRetry={refetch} />;
  if (!data) return <ErrorState message="No weather data available" onRetry={refetch} />;

  const { current, forecast, location: loc } = data;
  const cityDisplay = selectedLocation?.name || cityName || loc.name;
  const today = forecast.forecastday[0];

  return (
    <GradientBackground isDay={current.is_day} weatherCode={current.condition.code}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + theme.spacing.lg, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" colors={['#fff']} />
        }
      >
        <View style={{ paddingHorizontal: theme.spacing.xxl }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg }}>
            <TouchableOpacity
              onPress={() => router.push('/modal/city-search')}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.1)',
                paddingHorizontal: theme.spacing.lg,
                paddingVertical: theme.spacing.sm,
                borderRadius: theme.radius.full,
                gap: theme.spacing.sm,
              }}
            >
              <Ionicons name="location-outline" size={18} color={theme.colors.white} />
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }} numberOfLines={1}>{cityDisplay}</Text>
              <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onRefresh} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="refresh-outline" size={22} color="white" />
            </TouchableOpacity>
          </View>

          <View style={{ alignItems: 'center', marginTop: theme.spacing.lg, marginBottom: theme.spacing.xxxl }}>
            <WeatherIcon icon={current.condition.icon} size={120} />
            <AnimatedTemp value={formatTemp(current.temp_c, current.temp_f, unit)} unit={unit === 'celsius' ? 'C' : 'F'} />
            <Text style={{ color: theme.colors.text.secondary, fontSize: theme.typography.heading, marginTop: theme.spacing.xs }}>
              {current.condition.text}
            </Text>
            <Text style={{ color: theme.colors.text.tertiary, fontSize: theme.typography.body, marginTop: theme.spacing.sm }}>
              Feels like {formatTemp(current.feelslike_c, current.feelslike_f, unit)}°
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
              <Text style={{ color: theme.colors.text.secondary, fontSize: theme.typography.bodyLg }}>
                H: {formatTemp(today.day.maxtemp_c, today.day.maxtemp_f, unit)}°
              </Text>
              <View style={{ width: 48, height: 2, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 1 }} />
              <Text style={{ color: theme.colors.text.tertiary, fontSize: theme.typography.bodyLg }}>
                L: {formatTemp(today.day.mintemp_c, today.day.mintemp_f, unit)}°
              </Text>
            </View>
          </View>

          <GlassCard style={{ flexDirection: 'row', flexWrap: 'wrap', padding: theme.spacing.lg, marginBottom: theme.spacing.xxl }}>
            <StatItem icon="thermometer-outline" label="Feels Like" value={`${formatTemp(current.feelslike_c, current.feelslike_f, unit)}°`} />
            <StatItem icon="water-outline" label="Humidity" value={`${current.humidity}%`} />
            <StatItem icon="trending-up" label="Wind" value={formatWindSpeed(current.wind_kph, unit)} />
            <StatItem icon="sunny-outline" label="UV Index" value={`${current.uv}`} />
          </GlassCard>

          <Text style={{ color: theme.colors.text.primary, fontSize: theme.typography.bodyLg, fontWeight: '600', marginBottom: theme.spacing.lg }}>
            Hourly Forecast
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: theme.spacing.xxl }}>
            <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
              {(today?.hour || []).slice(0, 12).map((hour: any, i: number) => {
                const isNow = i === 0;
                return (
                  <GlassCard
                    key={i}
                    style={{
                      alignItems: 'center',
                      paddingVertical: theme.spacing.lg,
                      paddingHorizontal: theme.spacing.lg,
                      minWidth: 68,
                      backgroundColor: isNow ? 'rgba(79,172,254,0.2)' : theme.colors.glass.bg,
                      borderColor: isNow ? 'rgba(79,172,254,0.3)' : theme.colors.glass.border,
                    }}
                  >
                    <Text style={{ color: theme.colors.text.tertiary, fontSize: theme.typography.caption, fontWeight: isNow ? '600' : '400' }}>
                      {formatHourlyTime(hour.time, i)}
                    </Text>
                    <WeatherIcon icon={hour.condition.icon} size={28} />
                    <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: theme.typography.body, marginTop: theme.spacing.xs }}>
                      {formatTemp(hour.temp_c, hour.temp_f, unit)}°
                    </Text>
                  </GlassCard>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

function StatItem({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={{ width: '50%', alignItems: 'center', paddingVertical: theme.spacing.sm, gap: theme.spacing.xs }}>
      <Ionicons name={icon} size={20} color={theme.colors.text.tertiary} />
      <Text style={{ color: theme.colors.text.tertiary, fontSize: theme.typography.caption, letterSpacing: 0.5 }}>{label}</Text>
      <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: theme.typography.bodyLg }}>{value}</Text>
    </View>
  );
}
