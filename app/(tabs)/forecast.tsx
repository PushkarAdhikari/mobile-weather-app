import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useWeather } from '../../hooks/useWeather';
import { useLocation } from '../../hooks/useLocation';
import { useAppContext } from '../../constants/AppContext';
import { DEFAULT_LOCATION } from '../../constants/api';
import { theme, getThemeColors, ThemeColors } from '../../constants/theme';
import { GradientBackground } from '../../components/GradientBackground';
import { GlassCard } from '../../components/GlassCard';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { ErrorState } from '../../components/ErrorState';
import { WeatherIcon } from '../../components/WeatherIcon';
import { getDayName, formatTemp, formatDate } from '../../utils/weather';
import { DailyForecast } from '../../types/weather';

export default function ForecastScreen() {
  const router = useRouter();
  const { unit, selectedLocation, theme: themeMode, autoDetectLocation } = useAppContext();
  const colors = getThemeColors(themeMode);
  const { location: loc, loading: locLoading, cityName } = useLocation();

  const activeLat = selectedLocation?.lat ?? (autoDetectLocation ? loc?.lat : null) ?? DEFAULT_LOCATION.lat;
  const activeLng = selectedLocation?.lng ?? (autoDetectLocation ? loc?.lng : null) ?? DEFAULT_LOCATION.lng;

  const { data, isLoading, isError, error, refetch } = useWeather(activeLat, activeLng);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if ((autoDetectLocation && locLoading) || isLoading) return <LoadingSkeleton colors={colors} />;
  if (isError) return <ErrorState colors={colors} message={error?.message || 'Failed to load forecast'} onRetry={refetch} />;
  if (!data) return <ErrorState colors={colors} message="No forecast data available" onRetry={refetch} />;

  const { current, forecast, location: weatherLoc } = data;
  const cityDisplay = selectedLocation?.name || (autoDetectLocation && cityName ? cityName : null) || (autoDetectLocation ? '' : 'Select a City') || 'Unknown';
  const displayDate = formatDate(weatherLoc.localtime || current.last_updated);

  return (
    <GradientBackground isDay={current.is_day} weatherCode={current.condition.code} theme={themeMode}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: theme.spacing.xxl }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" colors={['#fff']} />
          }
        >
          <View style={{ marginBottom: theme.spacing.xxl }}>
            <TouchableOpacity
              onPress={() => router.push('/modal/city-search')}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                <Ionicons name="location-outline" size={18} color={colors.text.primary} />
                <Text style={{ color: colors.text.primary, fontSize: theme.typography.title, fontWeight: '700' }} numberOfLines={1}>
                  {cityDisplay}
                </Text>
                <Ionicons name="chevron-down" size={14} color={colors.text.tertiary} />
              </View>
              <Text style={{ color: colors.text.tertiary, fontSize: theme.typography.body, marginTop: 2, marginLeft: 28 }}>
                {displayDate}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={{ color: colors.text.primary, fontSize: theme.typography.title, fontWeight: '700', marginBottom: theme.spacing.xxl }}>
            7-Day Forecast
          </Text>

          <View style={{ gap: theme.spacing.md }}>
            {forecast.forecastday.map((day: DailyForecast, index: number) => (
              <ForecastCard key={day.date} day={day} index={index} unit={unit} colors={colors} />
            ))}
          </View>
        </ScrollView>

      </SafeAreaView>
    </GradientBackground>
  );
}

function ForecastCard({ day, index, unit, colors }: { day: DailyForecast; index: number; unit: string; colors: ThemeColors }) {
  const high = formatTemp(day.day.maxtemp_c, day.day.maxtemp_f, unit as any);
  const low = formatTemp(day.day.mintemp_c, day.day.mintemp_f, unit as any);

  return (
    <GlassCard colors={colors} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: theme.spacing.xl, paddingHorizontal: theme.spacing.xl }}>
      <View style={{ width: 88 }}>
        <Text style={{ color: colors.text.primary, fontWeight: '600', fontSize: 15 }} numberOfLines={1}>
          {getDayName(day.date)}
        </Text>
        {index === 0 && (
          <Text style={{ color: colors.text.muted, fontSize: theme.typography.caption, marginTop: theme.spacing.xs }}>
            {day.date}
          </Text>
        )}
      </View>

      <WeatherIcon code={day.day.condition.code} size={36} />

      <Text style={{ color: colors.text.tertiary, fontSize: theme.typography.body, flexShrink: 1, textAlign: 'center' }} numberOfLines={1}>
        {day.day.condition.text}
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, marginLeft: 'auto' }}>
        <Text style={{ color: colors.text.tertiary, fontWeight: '500', fontSize: theme.typography.body, width: 28, textAlign: 'right' }}>
          {low}°
        </Text>
        <View style={{ width: 40, height: 4, borderRadius: 2, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.12)' }}>
          <View
            style={{
              width: `${Math.min(Math.max((high - low) * 6 + 20, 20), 100)}%`,
              height: '100%',
              backgroundColor: high > 30 ? '#ff8c42' : colors.accent,
              borderRadius: 2,
            }}
          />
        </View>
        <Text style={{ color: colors.text.primary, fontWeight: '700', fontSize: theme.typography.body, width: 28 }}>
          {high}°
        </Text>
      </View>
    </GlassCard>
  );
}
