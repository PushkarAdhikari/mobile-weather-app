import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';

import { useWeather } from '../../hooks/useWeather';
import { useLocation } from '../../hooks/useLocation';
import { useAppContext } from '../../constants/AppContext';
import { DEFAULT_LOCATION } from '../../constants/api';
import { theme, getThemeColors, ThemeColors } from '../../constants/theme';
import { GradientBackground } from '../../components/GradientBackground';
import { GlassCard } from '../../components/GlassCard';
import { AnimatedTemp } from '../../components/AnimatedTemp';
import { WeatherIcon } from '../../components/WeatherIcon';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { ErrorState } from '../../components/ErrorState';
import { formatHourlyTime, formatTemp, formatWindSpeed, formatDate, getDayName } from '../../utils/weather';
import { DailyForecast } from '../../types/weather';

export default function HomeScreen() {
  const router = useRouter();
  const { unit, selectedLocation, theme: themeMode, showFeelsLike, use24hour, autoDetectLocation } = useAppContext();
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
  if (isError) return <ErrorState colors={colors} message={error?.message || 'Failed to load weather'} onRetry={refetch} />;
  if (!data) return <ErrorState colors={colors} message="No weather data available" onRetry={refetch} />;

  const { current, forecast, location: weatherLoc } = data;
  const cityDisplay = selectedLocation?.name || (autoDetectLocation && cityName ? cityName : null) || (autoDetectLocation ? '' : 'Select a City') || 'Unknown';
  const today = forecast.forecastday[0];
  const displayDate = formatDate(weatherLoc.localtime || current.last_updated);
  const rainChance = today?.day?.daily_chance_of_rain ?? 0;

  return (
    <GradientBackground isDay={current.is_day} weatherCode={current.condition.code} theme={themeMode}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" colors={['#fff']} />
        }
      >
        <View style={{ paddingHorizontal: theme.spacing.xxl }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm }}>
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
            <TouchableOpacity onPress={onRefresh} activeOpacity={0.7} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="refresh-outline" size={22} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={{ alignItems: 'center', marginTop: 0, marginBottom: theme.spacing.md }}>
            <WeatherIcon code={current.condition.code} size={140} />
            <AnimatedTemp colors={colors} value={formatTemp(current.temp_c, current.temp_f, unit)} unit={unit === 'celsius' ? 'C' : 'F'} />
            <Text style={{ color: colors.text.secondary, fontSize: theme.typography.title, fontWeight: '500', marginTop: theme.spacing.sm }}>
              {current.condition.text}
            </Text>
            {showFeelsLike && (
              <Text style={{ color: colors.text.tertiary, fontSize: theme.typography.bodyLg, marginTop: theme.spacing.xs }}>
                Feels like {formatTemp(current.feelslike_c, current.feelslike_f, unit)}°
              </Text>
            )}
          </View>

          <View style={{ flexDirection: 'row', gap: theme.spacing.md, marginBottom: theme.spacing.xxl }}>
            <GlassCard colors={colors} style={{ flex: 1, alignItems: 'center', paddingVertical: theme.spacing.lg, paddingHorizontal: theme.spacing.md }}>
              <Text style={{ color: colors.text.tertiary, fontSize: theme.typography.caption, fontWeight: '600', letterSpacing: 0.5 }}>HIGH</Text>
              <Text style={{ color: colors.text.primary, fontSize: theme.typography.heading, fontWeight: '700', marginTop: theme.spacing.xs }}>
                {formatTemp(today.day.maxtemp_c, today.day.maxtemp_f, unit)}°C
              </Text>
            </GlassCard>
            <GlassCard colors={colors} style={{ flex: 1, alignItems: 'center', paddingVertical: theme.spacing.lg, paddingHorizontal: theme.spacing.md }}>
              <Text style={{ color: colors.text.tertiary, fontSize: theme.typography.caption, fontWeight: '600', letterSpacing: 0.5 }}>LOW</Text>
              <Text style={{ color: colors.text.primary, fontSize: theme.typography.heading, fontWeight: '700', marginTop: theme.spacing.xs }}>
                {formatTemp(today.day.mintemp_c, today.day.mintemp_f, unit)}°C
              </Text>
            </GlassCard>
          </View>

          <GlassCard colors={colors} style={{ flexDirection: 'row', paddingVertical: theme.spacing.lg, paddingHorizontal: theme.spacing.xxl, marginBottom: theme.spacing.xxl, justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center', gap: theme.spacing.xs }}>
              <Ionicons name="water-outline" size={20} color={colors.text.tertiary} />
              <Text style={{ color: colors.text.tertiary, fontSize: theme.typography.caption, fontWeight: '500' }}>Humidity</Text>
              <Text style={{ color: colors.text.primary, fontWeight: '700', fontSize: theme.typography.bodyLg }}>{current.humidity}%</Text>
            </View>
            <View style={{ width: 1, backgroundColor: colors.surfaceBorder }} />
            <View style={{ alignItems: 'center', gap: theme.spacing.xs }}>
              <Ionicons name="trending-up" size={20} color={colors.text.tertiary} />
              <Text style={{ color: colors.text.tertiary, fontSize: theme.typography.caption, fontWeight: '500' }}>Wind</Text>
              <Text style={{ color: colors.text.primary, fontWeight: '700', fontSize: theme.typography.bodyLg }}>{formatWindSpeed(current.wind_kph, unit)}</Text>
            </View>
            <View style={{ width: 1, backgroundColor: colors.surfaceBorder }} />
            <View style={{ alignItems: 'center', gap: theme.spacing.xs }}>
              <Ionicons name="umbrella-outline" size={20} color={colors.text.tertiary} />
              <Text style={{ color: colors.text.tertiary, fontSize: theme.typography.caption, fontWeight: '500' }}>Rain</Text>
              <Text style={{ color: colors.text.primary, fontWeight: '700', fontSize: theme.typography.bodyLg }}>{rainChance}%</Text>
            </View>
          </GlassCard>

          <Text style={{ color: colors.text.secondary, fontSize: theme.typography.section, fontWeight: '700', letterSpacing: 1.2, marginBottom: theme.spacing.lg }}>
            HOURLY FORECAST
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: theme.spacing.xxl }}>
            <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
              {(today?.hour || []).slice(0, 12).map((hour: any, i: number) => {
                const isNow = i === 0;
                return (
                  <GlassCard
                    key={i}
                    colors={colors}
                    style={{
                      alignItems: 'center',
                      paddingVertical: theme.spacing.lg,
                      paddingHorizontal: theme.spacing.md,
                      minWidth: 90,
                      backgroundColor: isNow ? 'rgba(79,172,254,0.2)' : colors.surface,
                      borderColor: isNow ? 'rgba(79,172,254,0.3)' : colors.surfaceBorder,
                    }}
                  >
                    <Text style={{ color: colors.text.tertiary, fontSize: theme.typography.caption, fontWeight: isNow ? '700' : '500', marginBottom: theme.spacing.xs }}>
                      {formatHourlyTime(hour.time, i, use24hour)}
                    </Text>
                    <WeatherIcon code={hour.condition.code} size={32} />
                    <Text style={{ color: colors.text.primary, fontWeight: '700', fontSize: theme.typography.bodyLg, marginTop: theme.spacing.xs }}>
                      {formatTemp(hour.temp_c, hour.temp_f, unit)}°
                    </Text>
                  </GlassCard>
                );
              })}
            </View>
          </ScrollView>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.lg }}>
            <Text style={{ color: colors.text.secondary, fontSize: theme.typography.section, fontWeight: '700', letterSpacing: 1.2 }}>
              7-DAY FORECAST
            </Text>
            <TouchableOpacity onPress={() => router.push('/forecast')} activeOpacity={0.7}>
              <Text style={{ color: colors.accent, fontSize: theme.typography.body, fontWeight: '600' }}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={{ gap: theme.spacing.sm }}>
            {forecast.forecastday.slice(0, 5).map((day: DailyForecast, index: number) => (
              <CompactForecastRow key={day.date} day={day} index={index} unit={unit} colors={colors} />
            ))}
          </View>
        </View>
      </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

function CompactForecastRow({ day, index, unit, colors }: { day: DailyForecast; index: number; unit: string; colors: ThemeColors }) {
  const high = formatTemp(day.day.maxtemp_c, day.day.maxtemp_f, unit as any);
  const low = formatTemp(day.day.mintemp_c, day.day.mintemp_f, unit as any);

  return (
    <GlassCard colors={colors} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.xl }}>
      <Text style={{ color: colors.text.primary, fontWeight: '600', fontSize: theme.typography.bodyLg, width: 72 }}>
        {getDayName(day.date)}
      </Text>
      <WeatherIcon code={day.day.condition.code} size={28} />
      <Text style={{ color: colors.text.tertiary, fontSize: theme.typography.body, flexShrink: 1, textAlign: 'center' }} numberOfLines={1}>
        {day.day.condition.text}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, marginLeft: 'auto' }}>
        <Text style={{ color: colors.text.tertiary, fontWeight: '500', fontSize: theme.typography.bodyLg }}>{low}°</Text>
        <View style={{ width: 40, height: 4, borderRadius: 2, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.12)' }}>
          <View
            style={{
              width: `${Math.min(Math.max(((high - low) / 20) * 100, 20), 100)}%`,
              height: '100%',
              backgroundColor: high > 30 ? '#ff8c42' : colors.accent,
              borderRadius: 2,
            }}
          />
        </View>
        <Text style={{ color: colors.text.primary, fontWeight: '700', fontSize: theme.typography.bodyLg }}>{high}°</Text>
      </View>
    </GlassCard>
  );
}
