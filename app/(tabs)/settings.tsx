import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';

import { useAppContext } from '../../constants/AppContext';
import { useLocation } from '../../hooks/useLocation';
import { useWeather } from '../../hooks/useWeather';
import { DEFAULT_LOCATION } from '../../constants/api';
import { theme, getThemeColors, ThemeColors } from '../../constants/theme';
import { GradientBackground } from '../../components/GradientBackground';
import { GlassCard } from '../../components/GlassCard';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { ErrorState } from '../../components/ErrorState';
import { TemperatureUnit, PressureUnit } from '../../types/weather';
import { clearCache } from '../../services/cache';
import { t, Language } from '../../utils/i18n';

function SettingsRow({ label, value, colors }: { label: string; value: string; colors: ThemeColors }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={{ color: colors.text.secondary, fontSize: theme.typography.bodyLg }}>{label}</Text>
      <Text style={{ color: colors.text.primary, fontSize: theme.typography.bodyLg, fontWeight: '500' }}>{value}</Text>
    </View>
  );
}

function ToggleRow({ label, value, onToggle, colors }: { label: string; value: boolean; onToggle: () => void; colors: ThemeColors }) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.7}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.md,
      }}
    >
      <Text style={{ color: colors.text.secondary, fontSize: theme.typography.bodyLg }}>{label}</Text>
      <View
        style={{
          width: 48,
          height: 28,
          borderRadius: 14,
          backgroundColor: value ? colors.accent : colors.surface,
          padding: 2,
        }}
      >
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: '#FFFFFF',
            alignSelf: value ? 'flex-end' : 'flex-start',
          }}
        />
      </View>
    </TouchableOpacity>
  );
}

function OptionRow({ label, options, selected, onSelect, colors }: {
  label: string;
  options: { key: string; label: string }[];
  selected: string;
  onSelect: (key: string) => void;
  colors: ThemeColors;
}) {
  return (
    <View>
      <Text style={{ color: colors.text.tertiary, fontSize: theme.typography.caption, fontWeight: '600', marginBottom: theme.spacing.sm }}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
        {options.map((opt) => {
          const isSelected = selected === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              onPress={() => onSelect(opt.key)}
              activeOpacity={0.7}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${label}: ${opt.label}`}
              style={{
                paddingVertical: theme.spacing.sm,
                paddingHorizontal: theme.spacing.lg,
                borderRadius: theme.radius.full,
                backgroundColor: isSelected ? colors.accent : colors.surface,
              }}
            >
              <Text
                style={{
                  color: isSelected ? '#FFFFFF' : colors.text.secondary,
                  fontSize: theme.typography.body,
                  fontWeight: isSelected ? '600' : '400',
                }}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { location } = useLocation();
  const { data, isLoading, isError, error, refetch } = useWeather(location?.lat ?? DEFAULT_LOCATION.lat, location?.lng ?? DEFAULT_LOCATION.lng);
  const [refreshing, setRefreshing] = useState(false);

  const ctx = useAppContext();
  const { theme: themeMode, setTheme, language, setLanguage } = ctx;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading) return <GradientBackground isDay={1} weatherCode={1000} theme={themeMode}><LoadingSkeleton colors={getThemeColors(themeMode)} /></GradientBackground>;
  if (isError) return <GradientBackground isDay={1} weatherCode={1000} theme={themeMode}><ErrorState colors={getThemeColors(themeMode)} message={error?.message || 'Failed to load settings'} onRetry={refetch} /></GradientBackground>;

  const isDay = data?.current.is_day ?? 1;
  const weatherCode = data?.current.condition.code ?? 1000;
  const colors = getThemeColors(themeMode, weatherCode, isDay);

  const handleClearCache = async () => {
    await clearCache();
    Alert.alert('Cache Cleared', 'Temporary weather data has been cleared.');
  };

  const handleReset = () => {
    Alert.alert(
      t('reset_settings', language),
      t('confirm_reset', language),
      [
        { text: t('cancel', language), style: 'cancel' },
        { text: t('reset', language), style: 'destructive', onPress: () => {
          ctx.setTheme('dark');
          ctx.setUnit('celsius');
          ctx.setWindUnit('kmh');
          ctx.setPressureUnit('hpa');
          ctx.setAutoDetectLocation(true);
          ctx.setSevereAlerts(true);
          ctx.setDailyForecastNotify(false);
          ctx.setPrecipWarnings(true);
          ctx.setShowFeelsLike(true);
          ctx.setUse24hour(false);
          ctx.setUseCellularData(true);
          ctx.setAnalyticsConsent(false);
          ctx.setRefreshInterval(30);
        }},
      ]
    );
  };

  return (
    <GradientBackground isDay={isDay} weatherCode={weatherCode} theme={themeMode}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom, paddingHorizontal: theme.spacing.xxl, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text.primary} colors={[colors.text.primary]} />
        }
      >
        <Text style={{ color: colors.text.primary, fontSize: theme.typography.title, fontWeight: '700', marginBottom: theme.spacing.xxl }}>
          {t('settings', language)}
        </Text>

        {/* ---- Appearance ---- */}
        <GlassCard colors={colors} style={{ padding: theme.spacing.xxl, marginBottom: theme.spacing.lg }}>
          <Text style={{ color: colors.text.tertiary, fontSize: theme.typography.section, fontWeight: '700', letterSpacing: 1.2, marginBottom: theme.spacing.lg }}>
            {t('appearance', language)}
          </Text>
          <View style={{ gap: theme.spacing.sm }}>
            {['dark', 'light'].map((mode) => {
              const selected = themeMode === mode;
              return (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setTheme(mode as 'dark' | 'light')}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: theme.spacing.md,
                    paddingHorizontal: theme.spacing.xl,
                    borderRadius: theme.radius.md,
                    backgroundColor: selected ? `${colors.accent}26` : 'transparent',
                    borderWidth: 1,
                    borderColor: selected ? `${colors.accent}40` : 'transparent',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
                    <Ionicons name={mode === 'dark' ? 'moon-outline' : 'sunny-outline'} size={22} color={selected ? colors.accent : colors.text.tertiary} />
                    <Text style={{ color: selected ? colors.text.primary : colors.text.secondary, fontSize: theme.typography.bodyLg, fontWeight: selected ? '600' : '400' }}>
                      {mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                    </Text>
                  </View>
                  {selected && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </GlassCard>

        {/* ---- Language ---- */}
        <GlassCard colors={colors} style={{ padding: theme.spacing.xxl, marginBottom: theme.spacing.lg }}>
          <Text style={{ color: colors.text.tertiary, fontSize: theme.typography.section, fontWeight: '700', letterSpacing: 1.2, marginBottom: theme.spacing.lg }}>
            {t('general', language)}
          </Text>
          <OptionRow
            label={t('language', language)}
            options={[
              { key: 'en', label: 'English' },
              { key: 'es', label: 'Español' },
              { key: 'fr', label: 'Français' },
              { key: 'de', label: 'Deutsch' },
              { key: 'pt', label: 'Português' },
            ]}
            selected={language}
            onSelect={(k) => setLanguage(k as Language)}
            colors={colors}
          />
        </GlassCard>

        {/* ---- Units ---- */}
        <GlassCard colors={colors} style={{ padding: theme.spacing.xxl, marginBottom: theme.spacing.lg }}>
          <Text style={{ color: colors.text.tertiary, fontSize: theme.typography.section, fontWeight: '700', letterSpacing: 1.2, marginBottom: theme.spacing.lg }}>
            {t('units', language)}
          </Text>
          <OptionRow
            label={t('temperature', language)}
            options={[
              { key: 'celsius', label: '°C' },
              { key: 'fahrenheit', label: '°F' },
            ]}
            selected={ctx.unit}
            onSelect={(k) => ctx.setUnit(k as TemperatureUnit)}
            colors={colors}
          />
          <View style={{ height: theme.spacing.lg }} />
          <OptionRow
            label={t('wind_speed', language)}
            options={[
              { key: 'kmh', label: 'km/h' },
              { key: 'mph', label: 'mph' },
            ]}
            selected={ctx.windUnit}
            onSelect={(k) => ctx.setWindUnit(k as 'kmh' | 'mph')}
            colors={colors}
          />
          <View style={{ height: theme.spacing.lg }} />
          <OptionRow
            label={t('pressure', language)}
            options={[
              { key: 'hpa', label: 'hPa' },
              { key: 'inhg', label: 'inHg' },
              { key: 'mmhg', label: 'mmHg' },
            ]}
            selected={ctx.pressureUnit}
            onSelect={(k) => ctx.setPressureUnit(k as PressureUnit)}
            colors={colors}
          />
        </GlassCard>

        {/* ---- Location ---- */}
        <GlassCard colors={colors} style={{ padding: theme.spacing.xxl, marginBottom: theme.spacing.lg }}>
          <Text style={{ color: colors.text.tertiary, fontSize: theme.typography.section, fontWeight: '700', letterSpacing: 1.2, marginBottom: theme.spacing.lg }}>
            {t('location', language)}
          </Text>
          <ToggleRow label={t('auto_detect', language)} value={ctx.autoDetectLocation} onToggle={() => ctx.setAutoDetectLocation(!ctx.autoDetectLocation)} colors={colors} />
        </GlassCard>

        {/* ---- Advanced ---- */}
        <GlassCard colors={colors} style={{ padding: theme.spacing.xxl, marginBottom: theme.spacing.lg }}>
          <Text style={{ color: colors.text.tertiary, fontSize: theme.typography.section, fontWeight: '700', letterSpacing: 1.2, marginBottom: theme.spacing.lg }}>
            {t('advanced', language)}
          </Text>
          <TouchableOpacity activeOpacity={0.7} onPress={handleClearCache} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, paddingVertical: theme.spacing.md }}>
            <Ionicons name="trash-outline" size={22} color={colors.text.tertiary} />
            <Text style={{ color: colors.text.secondary, fontSize: theme.typography.bodyLg }}>Clear Cache</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} onPress={handleReset} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, paddingVertical: theme.spacing.md }}>
            <Ionicons name="refresh-outline" size={22} color="#ff4444" />
            <Text style={{ color: '#ff4444', fontSize: theme.typography.bodyLg }}>{t('reset_settings', language)}</Text>
          </TouchableOpacity>
        </GlassCard>

        {/* ---- About ---- */}
        <GlassCard colors={colors} style={{ padding: theme.spacing.xxl, marginBottom: theme.spacing.lg }}>
          <Text style={{ color: colors.text.tertiary, fontSize: theme.typography.section, fontWeight: '700', letterSpacing: 1.2, marginBottom: theme.spacing.lg }}>
            {t('general', language)}
          </Text>
          <View style={{ gap: theme.spacing.xl }}>
            <SettingsRow label="Version" value="2.1.0 (Build 42)" colors={colors} />
            <SettingsRow label="Weather Data" value="Open-Meteo" colors={colors} />
            <SettingsRow label="Auto-Refresh" value={`Every ${ctx.refreshInterval} minutes`} colors={colors} />
            <SettingsRow label="API Status" value="Operational" colors={colors} />
            <SettingsRow label="Last Updated" value="Jul 1, 2026" colors={colors} />
          </View>
        </GlassCard>

        <Text style={{ color: colors.text.muted, fontSize: theme.typography.body, textAlign: 'center', marginTop: theme.spacing.xxxl, lineHeight: 22 }}>
          Weather App {'\n'}Developed by Pushkar Adhikari
        </Text>
      </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}
