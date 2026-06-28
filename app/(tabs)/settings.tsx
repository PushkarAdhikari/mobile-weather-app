import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAppContext } from '../../constants/AppContext';
import { useLocation } from '../../hooks/useLocation';
import { useWeather } from '../../hooks/useWeather';
import { DEFAULT_LOCATION } from '../../constants/api';
import { theme } from '../../constants/theme';
import { GradientBackground } from '../../components/GradientBackground';
import { GlassCard } from '../../components/GlassCard';
import { TemperatureUnit } from '../../types/weather';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { unit, setUnit } = useAppContext();
  const { location } = useLocation();
  const { data } = useWeather(location?.lat ?? DEFAULT_LOCATION.lat, location?.lng ?? DEFAULT_LOCATION.lng);

  const units: { label: string; value: TemperatureUnit; icon: keyof typeof Ionicons.glyphMap }[] = [
    { label: 'Celsius (°C)', value: 'celsius', icon: 'thermometer-outline' },
    { label: 'Fahrenheit (°F)', value: 'fahrenheit', icon: 'thermometer-outline' },
  ];

  return (
    <GradientBackground isDay={data?.current.is_day ?? 1} weatherCode={data?.current.condition.code ?? 1000}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + theme.spacing.lg, paddingBottom: 40, paddingHorizontal: theme.spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ color: '#FFFFFF', fontSize: theme.typography.title, fontWeight: '700', marginBottom: theme.spacing.xxl }}>
          Settings
        </Text>

        <GlassCard style={{ padding: theme.spacing.xl, marginBottom: theme.spacing.lg }}>
          <Text style={{ color: theme.colors.text.tertiary, fontSize: theme.typography.caption, fontWeight: '600', letterSpacing: 1, marginBottom: theme.spacing.lg }}>
            TEMPERATURE UNIT
          </Text>
          <View style={{ gap: theme.spacing.sm }}>
            {units.map((item) => {
              const selected = unit === item.value;
              return (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => setUnit(item.value)}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 14,
                    paddingHorizontal: theme.spacing.lg,
                    borderRadius: theme.radius.md,
                    backgroundColor: selected ? 'rgba(79,172,254,0.15)' : 'transparent',
                    borderWidth: 1,
                    borderColor: selected ? 'rgba(79,172,254,0.25)' : 'transparent',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
                    <Ionicons name={item.icon} size={20} color={selected ? theme.colors.accent : theme.colors.text.tertiary} />
                    <Text style={{ color: selected ? '#FFFFFF' : theme.colors.text.secondary, fontSize: theme.typography.bodyLg, fontWeight: selected ? '600' : '400' }}>
                      {item.label}
                    </Text>
                  </View>
                  {selected && (
                    <Ionicons name="checkmark-circle" size={22} color={theme.colors.accent} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </GlassCard>

        <GlassCard style={{ padding: theme.spacing.xl, marginBottom: theme.spacing.lg }}>
          <Text style={{ color: theme.colors.text.tertiary, fontSize: theme.typography.caption, fontWeight: '600', letterSpacing: 1, marginBottom: theme.spacing.lg }}>
            ABOUT
          </Text>
          <View style={{ gap: theme.spacing.lg }}>
            <SettingsRow label="App Version" value="1.0.0" />
            <SettingsRow label="Weather Source" value="Open-Meteo" />
            <SettingsRow label="Data Refresh" value="Every 30 min" />
            <SettingsRow label="API Type" value="Free, no key required" />
          </View>
        </GlassCard>

        <Text style={{ color: theme.colors.text.muted, fontSize: theme.typography.caption, textAlign: 'center', marginTop: theme.spacing.xxxl, lineHeight: 18 }}>
          Weather App {'\n'}Built with React Native + Expo
        </Text>
      </ScrollView>
    </GradientBackground>
  );
}

function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={{ color: theme.colors.text.secondary, fontSize: theme.typography.body }}>{label}</Text>
      <Text style={{ color: '#FFFFFF', fontSize: theme.typography.body, fontWeight: '500' }}>{value}</Text>
    </View>
  );
}
