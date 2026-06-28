import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';

import { useWeather } from '../../hooks/useWeather';
import { useLocation } from '../../hooks/useLocation';
import { useAppContext } from '../../constants/AppContext';
import { DEFAULT_LOCATION } from '../../constants/api';
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

  return (
    <GradientBackground isDay={current.is_day} weatherCode={current.condition.code}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" colors={['#fff']} />
        }
      >
        <View style={{ paddingHorizontal: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => router.push('/modal/city-search')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
            >
              <Ionicons name="location-outline" size={20} color="white" />
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '600' }}>{cityDisplay}</Text>
              <Ionicons name="chevron-down" size={16} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onRefresh}>
              <Ionicons name="refresh-outline" size={22} color="white" />
            </TouchableOpacity>
          </View>

          <View style={{ alignItems: 'center', marginVertical: 32 }}>
            <WeatherIcon icon={current.condition.icon} size={120} />
            <AnimatedTemp
              value={formatTemp(current.temp_c, current.temp_f, unit)}
              unit={unit === 'celsius' ? 'C' : 'F'}
              fontSize={72}
            />
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, marginTop: 4 }}>{current.condition.text}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 4 }}>
              H: {formatTemp(forecast.forecastday[0].day.maxtemp_c, forecast.forecastday[0].day.maxtemp_f, unit)}° • L: {formatTemp(forecast.forecastday[0].day.mintemp_c, forecast.forecastday[0].day.mintemp_f, unit)}°
            </Text>
          </View>

          <GlassCard style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 16, paddingHorizontal: 8, marginBottom: 24 }}>
            <DetailItem label="Feels Like" value={`${formatTemp(current.feelslike_c, current.feelslike_f, unit)}°`} icon="thermometer-outline" />
            <DetailItem label="Humidity" value={`${current.humidity}%`} icon="water-outline" />
            <DetailItem label="Wind" value={formatWindSpeed(current.wind_kph, unit)} icon="trending-up" />
            <DetailItem label="UV" value={`${current.uv}`} icon="sunny-outline" />
          </GlassCard>

          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600', marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' }}>
            Hourly Forecast
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {(forecast.forecastday[0]?.hour || []).slice(0, 12).map((hour: any, i: number) => (
                <GlassCard key={i} style={{ alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, minWidth: 72 }}>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                    {formatHourlyTime(hour.time, i)}
                  </Text>
                  <WeatherIcon icon={hour.condition.icon} size={32} />
                  <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 14, marginTop: 4 }}>
                    {formatTemp(hour.temp_c, hour.temp_f, unit)}°
                  </Text>
                </GlassCard>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

function DetailItem({ label, value, icon }: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={{ alignItems: 'center', gap: 4 }}>
      <Ionicons name={icon} size={18} color="rgba(255,255,255,0.6)" />
      <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{label}</Text>
      <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 14 }}>{value}</Text>
    </View>
  );
}
