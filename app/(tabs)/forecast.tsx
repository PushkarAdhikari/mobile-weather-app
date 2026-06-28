import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';

import { useWeather } from '../../hooks/useWeather';
import { useLocation } from '../../hooks/useLocation';
import { useAppContext } from '../../constants/AppContext';
import { DEFAULT_LOCATION } from '../../constants/api';
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
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 40, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" colors={['#fff']} />
        }
      >
        <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '700', marginBottom: 24 }}>
          7-Day Forecast
        </Text>

        <View style={{ gap: 12 }}>
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
    <GlassCard style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20 }}>
      <Text style={{ color: '#FFFFFF', fontWeight: '600', width: 96 }}>{getDayName(day.date)}</Text>

      <WeatherIcon icon={day.day.condition.icon} size={36} />

      <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, flex: 1, textAlign: 'center', marginLeft: 8 }}>
        {day.day.condition.text}
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontWeight: '500' }}>{low}°</Text>
        <View style={{ width: 64, height: 6, borderRadius: 3, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.2)' }}>
          <View
            style={{
              width: `${Math.abs(high - low) * 10 + 30}%`,
              height: '100%',
              backgroundColor: 'rgba(255,255,255,0.5)',
              borderRadius: 3,
            }}
          />
        </View>
        <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>{high}°</Text>
      </View>
    </GlassCard>
  );
}
