import { memo, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useCallback, useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSpring, Easing } from 'react-native-reanimated';

import { useWeather } from '../../hooks/useWeather';
import { useLocation } from '../../hooks/useLocation';
import { useAppContext } from '../../constants/AppContext';
import { DEFAULT_LOCATION } from '../../constants/api';
import { theme, getThemeColors, ThemeColors } from '../../constants/theme';
import { GradientBackground } from '../../components/GradientBackground';
import { GlassCard } from '../../components/GlassCard';
import { AnimatedTemp } from '../../components/AnimatedTemp';
import { WeatherIcon } from '../../components/WeatherIcon';
import { WeatherScene } from '../../components/WeatherScene';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { ErrorState } from '../../components/ErrorState';
import { AirQualityGauge } from '../../components/AirQualityGauge';
import { formatHourlyTime, formatTemp, formatWindSpeed, formatPressure, formatVisibility, formatDate, getDayName, getClosestHourIndex, isHourDaytime, formatISOTime } from '../../utils/weather';
import { notifyNewAlerts } from '../../utils/notifications';
import { t, Language } from '../../utils/i18n';
import { DailyForecast } from '../../types/weather';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { unit, windUnit, pressureUnit, selectedLocation, theme: themeMode, showFeelsLike, use24hour, autoDetectLocation, refreshInterval, language } = useAppContext();
  const { location: loc, loading: locLoading, cityName } = useLocation();

  const activeLat = useMemo(() => selectedLocation?.lat ?? (autoDetectLocation ? loc?.lat : null) ?? DEFAULT_LOCATION.lat, [selectedLocation?.lat, autoDetectLocation, loc?.lat]);
  const activeLng = useMemo(() => selectedLocation?.lng ?? (autoDetectLocation ? loc?.lng : null) ?? DEFAULT_LOCATION.lng, [selectedLocation?.lng, autoDetectLocation, loc?.lng]);

  const { data, isLoading, isError, error, refetch } = useWeather(activeLat, activeLng, refreshInterval);
  const [refreshing, setRefreshing] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [bannerReady, setBannerReady] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const bannerOpacity = useSharedValue(0);

  const bannerStyle = useAnimatedStyle(() => ({
    opacity: bannerOpacity.value,
    transform: [{ translateY: (1 - bannerOpacity.value) * -10 }],
  }));

  const cityDisplay = useMemo(() => selectedLocation?.name || (autoDetectLocation && cityName ? cityName : null) || (autoDetectLocation ? '' : 'Select a City') || 'Unknown', [selectedLocation?.name, autoDetectLocation, cityName]);

  useEffect(() => {
    if (data?.alerts?.alert?.length) {
      notifyNewAlerts(data.alerts.alert);
    }
  }, [data?.alerts]);

  if ((autoDetectLocation && locLoading) || isLoading) return <GradientBackground isDay={1} weatherCode={1000} theme={themeMode}><LoadingSkeleton colors={getThemeColors(themeMode)} /></GradientBackground>;
  if (isError) return <GradientBackground isDay={1} weatherCode={1000} theme={themeMode}><ErrorState colors={getThemeColors(themeMode)} message={error?.message || 'Failed to load weather'} onRetry={refetch} /></GradientBackground>;
  if (!data) return <GradientBackground isDay={1} weatherCode={1000} theme={themeMode}><ErrorState colors={getThemeColors(themeMode)} message="No weather data available" onRetry={refetch} /></GradientBackground>;

  const { current, forecast, location: weatherLoc } = data;
  const colors = getThemeColors(themeMode, current.condition.code, current.is_day);
  const today = forecast.forecastday[0];

  const displayDate = formatDate(weatherLoc.localtime || current.last_updated);
  const startIdx = getClosestHourIndex(today?.hour || [], weatherLoc.localtime);
  const orderedHours = startIdx > 0 ? [...(today?.hour || []).slice(startIdx), ...(today?.hour || []).slice(0, startIdx)] : (today?.hour || []);
  const rainChance = today?.day?.daily_chance_of_rain ?? 0;
  const sunrise = today?.astro?.sunrise ?? '';
  const sunset = today?.astro?.sunset ?? '';
  const alerts = data.alerts?.alert ?? [];
  const visibleAlerts = alerts.filter((a) => !dismissedAlerts.has(a.headline));

  if (visibleAlerts.length > 0 && !bannerReady) {
    setBannerReady(true);
    bannerOpacity.value = withTiming(1, { duration: 400 });
  }

  const alertSeverityColor: Record<string, string> = {
    Extreme: '#ff4444', Severe: '#ff8800', Moderate: '#ffaa00', Minor: '#ffcc00',
  };

  const dismissAlert = (headline: string) => {
    setDismissedAlerts((prev) => new Set(prev).add(headline));
  };

  return (
    <GradientBackground isDay={current.is_day} weatherCode={current.condition.code} theme={themeMode}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text.primary} colors={[colors.text.primary]} />
        }
      >
        {visibleAlerts.map((alert) => (
          <Animated.View key={alert.headline} style={[bannerStyle, { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceBorder, borderRadius: 14, marginBottom: theme.spacing.md, overflow: 'hidden' }]}>
            <View style={{ width: 4, height: '100%', backgroundColor: alertSeverityColor[alert.severity] || '#ffcc00' }} />
            <TouchableOpacity
              onPress={() => router.push('/alerts')}
              activeOpacity={0.7}
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, paddingVertical: theme.spacing.sm, paddingLeft: theme.spacing.md }}
            >
              <Ionicons name="alert-circle" size={20} color={alertSeverityColor[alert.severity] || '#ffcc00'} />
              <Text style={{ color: colors.text.primary, fontSize: 14, fontWeight: '600', flexShrink: 1 }} numberOfLines={1}>
                {alert.headline}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => dismissAlert(alert.headline)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ padding: theme.spacing.sm }} accessibilityLabel="Dismiss alert" accessibilityRole="button">
              <Ionicons name="close" size={18} color={colors.text.muted} />
            </TouchableOpacity>
          </Animated.View>
        ))}
        <View style={{ paddingHorizontal: theme.spacing.xxl, paddingTop: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm }}>
            <TouchableOpacity
              onPress={() => router.push('/modal/city-search')}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Change location"
              accessibilityRole="button"
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                <Ionicons name="location" size={22} color={colors.accent} />
                <Text style={{ color: colors.text.primary, fontSize: 26, fontWeight: '700', letterSpacing: -0.5 }} numberOfLines={1}>
                  {cityDisplay}
                </Text>
                <Feather name="chevron-down" size={18} color={colors.text.tertiary} />
              </View>
              <Text style={{ color: colors.text.tertiary, fontSize: theme.typography.body, marginTop: 2, marginLeft: 28 }}>
                {displayDate}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onRefresh} activeOpacity={0.7} style={{ backgroundColor: colors.surface, padding: 10, borderRadius: 50, borderWidth: 1, borderColor: colors.surfaceBorder }} accessibilityLabel="Refresh weather" accessibilityRole="button">
              <Ionicons name="refresh" size={20} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={{ alignItems: 'center', marginVertical: 30 }}>
            <WeatherScene code={current.condition.code} isDay={current.is_day} size={130} />
            <AnimatedTemp colors={colors} value={formatTemp(current.temp_c, current.temp_f, unit)} unit={unit === 'celsius' ? 'C' : 'F'} fontSize={92} />
            <Text style={{ color: colors.text.primary, fontSize: 24, fontWeight: '600', letterSpacing: -0.5, marginTop: 5 }}>
              {current.condition.text}
            </Text>
            {showFeelsLike && (
              <Text style={{ color: colors.text.tertiary, fontSize: 15, marginTop: 4 }}>
                {t('feels_like', language)} {formatTemp(current.feelslike_c, current.feelslike_f, unit)}°
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

          <View style={{ marginBottom: theme.spacing.xxl }}>
            <Text style={{ color: colors.text.tertiary, fontSize: 13, fontWeight: '700', letterSpacing: 1.2, marginBottom: theme.spacing.md }}>
              {t('todays_details', language)}
            </Text>
            <MetricsCard
              humidity={`${current.humidity}%`}
              wind={formatWindSpeed(current.wind_kph, windUnit)}
              rain={`${rainChance}%`}
              pressure={formatPressure(current.pressure_mb, pressureUnit)}
              uv={`${current.uv}`}
              visibility={formatVisibility(current.vis_km)}
              humidityLabel={t('humidity', language)}
              windLabel={t('wind', language)}
              rainLabel="Rain"
              pressureLabel={t('pressure_label', language)}
              uvLabel={t('uv_index', language)}
              visibilityLabel={t('visibility', language)}
              colors={colors}
            />
          </View>

          {data.airQuality && (
            <View style={{ marginBottom: theme.spacing.xxl }}>
              <Text style={{ color: colors.text.tertiary, fontSize: 13, fontWeight: '700', letterSpacing: 1.2, marginBottom: theme.spacing.md }}>
                AIR QUALITY
              </Text>
              <View style={{ borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceBorder, padding: theme.spacing.xl }}>
                <AirQualityGauge aqi={data.airQuality.us_aqi} pm25={data.airQuality.pm2_5} pm10={data.airQuality.pm10} language={language} colors={colors} />
              </View>
            </View>
          )}

          <SunArc sunrise={sunrise} sunset={sunset} language={language} colors={colors} />

          <Text style={{ color: colors.text.secondary, fontSize: theme.typography.section, fontWeight: '700', letterSpacing: 1.2, marginBottom: theme.spacing.lg }}>
            {t('hourly_forecast', language)}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: theme.spacing.xxl }}>
            <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
              {orderedHours.slice(0, 24).map((hour: any, i: number) => {
                const isNow = i === 0;
                const hourIsDay = isHourDaytime(hour.time, sunrise, sunset);
                if (isNow) return <NowCard key={i} hour={hour} index={i} use24hour={use24hour} unit={unit} accent={colors.accent} isDay={hourIsDay} colors={colors} />;
                return (
                  <GlassCard key={i} colors={colors} style={{ alignItems: 'center', paddingVertical: theme.spacing.lg, paddingHorizontal: theme.spacing.md, minWidth: 90 }}>
                    <Text style={{ color: colors.text.tertiary, fontSize: theme.typography.caption, fontWeight: '500', marginBottom: theme.spacing.xs }}>
                      {formatHourlyTime(hour.time, i, use24hour)}
                    </Text>
                    <WeatherIcon code={hour.condition.code} size={32} isDay={hourIsDay} />
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
              {t('7_day_forecast', language)}
            </Text>
            <TouchableOpacity onPress={() => router.push('/forecast')} activeOpacity={0.7} accessibilityLabel="View full forecast" accessibilityRole="button">
              <Text style={{ color: colors.accent, fontSize: theme.typography.body, fontWeight: '600' }}>{t('see_all', language)}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ gap: theme.spacing.sm }}>
            {forecast.forecastday.slice(0, 7).map((day: DailyForecast, index: number) => (
              <CompactForecastRow key={day.date} day={day} index={index} unit={unit} colors={colors} language={language} />
            ))}
          </View>
        </View>
      </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const SunArc = memo(function SunArc({ sunrise, sunset, language, colors }: { sunrise: string; sunset: string; language: Language; colors: ThemeColors }) {
  const arcWidth = width - theme.spacing.xxl * 2 - 32;
  const arcHeight = 60;

  const sunriseDisplay = useMemo(() => formatISOTime(sunrise), [sunrise]);
  const sunsetDisplay = useMemo(() => formatISOTime(sunset), [sunset]);

  const getProgress = () => {
    if (!sunrise || !sunset) return 0;
    const now = new Date();
    const sunriseDate = new Date(sunrise);
    const sunsetDate = new Date(sunset);
    if (isNaN(sunriseDate.getTime()) || isNaN(sunsetDate.getTime())) return 0;
    const dayLen = sunsetDate.getTime() - sunriseDate.getTime();
    const elapsed = now.getTime() - sunriseDate.getTime();
    return dayLen > 0 ? Math.max(0, Math.min(1, elapsed / dayLen)) : 0;
  };

  const progress = getProgress();
  const sunX = progress * arcWidth;
  const sunY = arcHeight * Math.sin(Math.PI * Math.min(progress, 1));

  return (
    <View style={{ marginBottom: theme.spacing.xxl }}>
      <Text style={{ color: colors.text.tertiary, fontSize: 13, fontWeight: '700', letterSpacing: 1.2, marginBottom: theme.spacing.md }}>
        {t('sunrise_sunset', language)}
      </Text>
      <View style={{ borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceBorder, padding: theme.spacing.xl }}>
        <View style={{ height: arcHeight + 20, justifyContent: 'flex-end' }}>
          <View style={{ height: arcHeight, overflow: 'hidden' }}>
            <View style={{ width: '100%', height: arcHeight * 2, borderRadius: arcHeight, borderWidth: 2, borderColor: colors.surfaceBorder, backgroundColor: 'transparent' }} />
          </View>
          <View style={{ position: 'absolute', bottom: 0, left: 0, height: arcHeight, width: `${Math.min(progress * 100, 100)}%`, overflow: 'hidden' }}>
            <View style={{ width: '100%', height: arcHeight * 2, borderRadius: arcHeight, borderWidth: 2, borderColor: colors.accent, backgroundColor: 'transparent' }} />
          </View>
          {progress > 0 && progress < 1 && (
            <View style={{ position: 'absolute', bottom: sunY - 6, left: Math.max(0, Math.min(sunX - 6, arcWidth - 12)) }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#FBBF24' }} />
            </View>
          )}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <View style={{ alignItems: 'flex-start' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Feather name="sunrise" size={14} color="#FBBF24" />
              <Text style={{ color: colors.text.tertiary, fontSize: 11, fontWeight: '500' }}>{t('sunrise', language)}</Text>
            </View>
            <Text style={{ color: colors.text.primary, fontSize: 15, fontWeight: '600', marginTop: 2 }}>{sunriseDisplay}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Feather name="sunset" size={14} color="#F97316" />
              <Text style={{ color: colors.text.tertiary, fontSize: 11, fontWeight: '500' }}>{t('sunset', language)}</Text>
            </View>
            <Text style={{ color: colors.text.primary, fontSize: 15, fontWeight: '600', marginTop: 2 }}>{sunsetDisplay}</Text>
          </View>
        </View>
      </View>
    </View>
  );
});

type MetricsCardProps = {
  humidity: string; wind: string; rain: string; pressure: string; uv: string; visibility: string;
  humidityLabel: string; windLabel: string; rainLabel: string; pressureLabel: string; uvLabel: string; visibilityLabel: string;
  colors: ThemeColors;
};

const metricsConfig = [
  { key: 'humidity', icon: 'water-outline', iconSet: 'Ionicons', color: '#7AB8FF' },
  { key: 'wind', icon: 'wind', iconSet: 'Feather', color: '#4BE3C2' },
  { key: 'rain', icon: 'umbrella-outline', iconSet: 'Ionicons', color: '#FF74C6' },
  { key: 'pressure', icon: 'gauge', iconSet: 'MaterialCommunityIcons', color: '#8E7CFF' },
  { key: 'uv', icon: 'sun', iconSet: 'Feather', color: '#FFC84D' },
  { key: 'visibility', icon: 'eye-outline', iconSet: 'Ionicons', color: '#39D5FF' },
] as const;

function MetricsIcon({ config }: { config: { readonly key: string; readonly icon: string; readonly iconSet: string; readonly color: string } }) {
  const size = 18;
  if (config.iconSet === 'Feather') return <Feather name={config.icon as any} size={size} color={config.color} />;
  if (config.iconSet === 'MaterialCommunityIcons') return <MaterialCommunityIcons name={config.icon as any} size={size} color={config.color} />;
  return <Ionicons name={config.icon as any} size={size} color={config.color} />;
}

function MetricCell({ config, label, value, colors }: { config: { readonly key: string; readonly icon: string; readonly iconSet: string; readonly color: string }; label: string; value: string; colors: ThemeColors }) {
  const scale = useSharedValue(1);
  const bgOpacity = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const bgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  return (
    <Animated.View style={[{ flex: 1, alignItems: 'center' }, animStyle]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={() => {
          scale.value = withTiming(0.98, { duration: 200, easing: Easing.inOut(Easing.ease) });
          bgOpacity.value = withTiming(1, { duration: 200 });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: 200, easing: Easing.inOut(Easing.ease) });
          bgOpacity.value = withTiming(0, { duration: 200 });
        }}
        accessibilityLabel={`${label}: ${value}`}
        accessibilityRole="text"
        style={{ width: '100%', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 12 }}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 12, backgroundColor: colors.surface },
            bgStyle,
          ]}
        />
        <MetricsIcon config={config} />
        <Text style={{ color: colors.text.secondary, fontSize: 12, fontWeight: '500', letterSpacing: 0.2, marginTop: 6 }}>{label}</Text>
        <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '700', lineHeight: 22, marginTop: 4 }}>{value}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const MetricsCard = memo(function MetricsCard(props: MetricsCardProps) {
  const labels: Record<string, string> = {
    humidity: props.humidityLabel, wind: props.windLabel, rain: props.rainLabel,
    pressure: props.pressureLabel, uv: props.uvLabel, visibility: props.visibilityLabel,
  };
  const values: Record<string, string> = {
    humidity: props.humidity, wind: props.wind, rain: props.rain,
    pressure: props.pressure, uv: props.uv, visibility: props.visibility,
  };

  const firstRow = metricsConfig.slice(0, 3);
  const secondRow = metricsConfig.slice(3, 6);

  const c = props.colors;

  const renderRow = (row: typeof metricsConfig[number][]) => (
    <View style={{ flexDirection: 'row', alignItems: 'stretch' }}>
      {row.map((config, i) => (
        <View key={config.key} style={{ flex: 1, flexDirection: 'row' }}>
          <MetricCell config={config} label={labels[config.key]} value={values[config.key]} colors={c} />
          {i < row.length - 1 && (
            <View style={{ width: 1, backgroundColor: c.surfaceBorder }} />
          )}
        </View>
      ))}
    </View>
  );

  return (
    <View style={{ borderRadius: 24, backgroundColor: c.surface, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 30, elevation: 10 }}>
      {renderRow(firstRow)}
      <View style={{ height: 1, backgroundColor: c.surfaceBorder, marginHorizontal: -20 }} />
      {renderRow(secondRow)}
    </View>
  );
});

const NowCard = memo(function NowCard({ hour, index, use24hour, unit, accent, isDay, colors }: { hour: any; index: number; use24hour: boolean; unit: string; accent: string; isDay: boolean; colors: ThemeColors }) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, []);

  const animStyle = useAnimatedStyle(() => {
    const p = pulse.value;
    return {
      transform: [{ scale: 1 + p * 0.035 }],
      shadowOpacity: 0.2 + p * 0.25,
    };
  });

  return (
    <Animated.View
      style={[
        {
          alignItems: 'center',
          paddingVertical: theme.spacing.lg,
          paddingHorizontal: theme.spacing.md,
          minWidth: 90,
          borderRadius: theme.radius.xl,
          backgroundColor: `${accent}33`,
          borderWidth: 1,
          borderColor: `${accent}55`,
          shadowColor: accent,
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: 12,
          elevation: 6,
        },
        animStyle,
      ]}
    >
      <Text style={{ color: colors.text.tertiary, fontSize: theme.typography.caption, fontWeight: '700', marginBottom: theme.spacing.xs }}>
        {formatHourlyTime(hour.time, index, use24hour)}
      </Text>
      <WeatherIcon code={hour.condition.code} size={32} isDay={isDay} />
      <Text style={{ color: colors.text.primary, fontWeight: '700', fontSize: theme.typography.bodyLg, marginTop: theme.spacing.xs }}>
        {formatTemp(hour.temp_c, hour.temp_f, unit as any)}°
      </Text>
    </Animated.View>
  );
});

const CompactForecastRow = memo(function CompactForecastRow({ day, index, unit, colors, language }: { day: DailyForecast; index: number; unit: string; colors: ThemeColors; language: Language }) {
  const high = formatTemp(day.day.maxtemp_c, day.day.maxtemp_f, unit as any);
  const low = formatTemp(day.day.mintemp_c, day.day.mintemp_f, unit as any);
  const range = high - low || 1;

  return (
    <GlassCard colors={colors} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.xl }}>
      <Text style={{ color: colors.text.primary, fontWeight: '600', fontSize: 15, width: 72 }} numberOfLines={1}>
        {getDayName(day.date, language)}
      </Text>
      <WeatherIcon code={day.day.condition.code} size={28} />
      <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', height: 20 }}>
          <Text style={{ color: colors.text.tertiary, fontWeight: '500', fontSize: 13, width: 32, textAlign: 'right' }}>{low}°</Text>
          <View style={{ flex: 1, height: 4, borderRadius: 2, overflow: 'hidden', backgroundColor: colors.surface, marginHorizontal: 6 }}>
            <View
              style={{
                width: `${Math.min(Math.max((range / 20) * 100, 20), 100)}%`,
                height: '100%',
                backgroundColor: high > 30 ? '#ff8c42' : colors.accent,
                borderRadius: 2,
              }}
            />
          </View>
          <Text style={{ color: colors.text.primary, fontWeight: '700', fontSize: 13, width: 32 }}>{high}°</Text>
        </View>
        {day.day.daily_chance_of_rain > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <View style={{ flex: 1, height: 3, borderRadius: 1.5, backgroundColor: `${colors.accent}22`, marginHorizontal: 6 }}>
              <View
                style={{
                  width: `${Math.min(day.day.daily_chance_of_rain, 100)}%`,
                  height: '100%',
                  backgroundColor: `${colors.accent}88`,
                  borderRadius: 1.5,
                }}
              />
            </View>
          </View>
        )}
      </View>
    </GlassCard>
  );
});
