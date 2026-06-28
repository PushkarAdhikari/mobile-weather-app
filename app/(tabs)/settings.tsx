import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAppContext } from '../../constants/AppContext';
import { useLocation } from '../../hooks/useLocation';
import { useWeather } from '../../hooks/useWeather';
import { DEFAULT_LOCATION } from '../../constants/api';
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
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 40, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '700', marginBottom: 24 }}>
          Settings
        </Text>

        <GlassCard style={{ padding: 20, marginBottom: 16 }}>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>
            Temperature Unit
          </Text>
          <View style={{ gap: 8 }}>
            {units.map((item) => (
              <TouchableOpacity
                key={item.value}
                onPress={() => setUnit(item.value)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  backgroundColor: unit === item.value ? 'rgba(255,255,255,0.15)' : 'transparent',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Ionicons name={item.icon} size={20} color="rgba(255,255,255,0.7)" />
                  <Text style={{ color: '#FFFFFF', fontSize: 16 }}>{item.label}</Text>
                </View>
                {unit === item.value && (
                  <Ionicons name="checkmark-circle" size={22} color="#4facfe" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </GlassCard>

        <GlassCard style={{ padding: 20, marginBottom: 16 }}>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>
            About
          </Text>
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>App Version</Text>
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '500' }}>1.0.0</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Weather Source</Text>
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '500' }}>WeatherAPI.com</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Data Refresh</Text>
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '500' }}>Every 30 min</Text>
            </View>
          </View>
        </GlassCard>

        <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, textAlign: 'center', marginTop: 32 }}>
          Weather App • Built with React Native + Expo
        </Text>
      </ScrollView>
    </GradientBackground>
  );
}
