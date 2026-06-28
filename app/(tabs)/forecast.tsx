import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { useWeather } from '../../hooks/useWeather';
import { useLocation } from '../../hooks/useLocation';
import { useAppContext } from '../../constants/AppContext';
import { DEFAULT_LOCATION } from '../../constants/api';
import { theme } from '../../constants/theme';
import { GradientBackground } from '../../components/GradientBackground';
import { GlassCard } from '../../components/GlassCard';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { ErrorState } from '../../components/ErrorState';
import { WeatherIcon } from '../../components/WeatherIcon';
import { getDayName, formatTemp } from '../../utils/weather';
import { DailyForecast } from '../../types/weather';

export default function ForecastScreen() {
  const insets = useSafeAreaInsets();
  const { unit, selectedLocation } = useAppContext();
  const { location } = useLocation();

  const activeLat = selectedLocation?.lat ?? location?.lat ?? DEFAULT_LOCATION.lat;
  const activeLng = selectedLocation?.lng ?? location?.lng ?? DEFAULT_LOCATION.lng;

  const { data, isLoading, isError, error, refetch } = useWeather(activeLat, activeLng);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading) return <LoadingSkeleton />;
  if (isError) return <ErrorState message={error?.message || 'Failed to load forecast'} onRetry={refetch} />;
  if (!data) return <ErrorState message="No forecast data available" onRetry={refetch} />;

  return (
    <GradientBackground isDay={data.current.is_day} weatherCode={data.current.condition.code}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + theme.spacing.lg, paddingBottom: 40, paddingHorizontal: theme.spacing.xl }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" colors={['#fff']} />
        }
      >
        <Text style={{ color: '#FFFFFF', fontSize: theme.typography.title, fontWeight: '700', marginBottom: theme.spacing.xxl }}>
          7-Day Forecast
        </Text>

        <View style={{ gap: theme.spacing.md }}>
          {data.forecast.forecastday.map((day: DailyForecast, index: number) => (
            <ForecastCard key={day.date} day={day} index={index} unit={unit} />
          ))}
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

function ForecastCard({ day, index, unit }: { day: DailyForecast; index: number; unit: string }) {
  const high = formatTemp(day.day.maxtemp_c, day.day.maxtemp_f, unit as any);
  const low = formatTemp(day.day.mintemp_c, day.day.mintemp_f, unit as any);

  return (
    <GlassCard style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: theme.spacing.lg, paddingHorizontal: theme.spacing.xl }}>
      <View style={{ width: 80 }}>
        <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: theme.typography.body }}>
          {getDayName(day.date)}
        </Text>
        {index === 0 && (
          <Text style={{ color: theme.colors.text.tertiary, fontSize: 10, marginTop: 2 }}>
            {day.date}
          </Text>
        )}
      </View>

      <WeatherIcon icon={day.day.condition.icon} size={32} />

      <Text style={{ color: theme.colors.text.tertiary, fontSize: theme.typography.caption, flex: 1, textAlign: 'center', marginHorizontal: theme.spacing.sm }} numberOfLines={1}>
        {day.day.condition.text}
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginLeft: 'auto' }}>
        <Text style={{ color: theme.colors.text.secondary, fontWeight: '500', fontSize: theme.typography.body, width: 28, textAlign: 'right' }}>
          {low}°
        </Text>
        <View style={{ width: 48, height: 4, borderRadius: 2, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.15)' }}>
          <View
            style={{
              width: `${Math.min(Math.max((high - low) * 6 + 20, 20), 100)}%`,
              height: '100%',
              backgroundColor: high > 30 ? '#ff8c42' : 'rgba(255,255,255,0.5)',
              borderRadius: 2,
            }}
          />
        </View>
        <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: theme.typography.body, width: 28 }}>
          {high}°
        </Text>
      </View>
    </GlassCard>
  );
}
