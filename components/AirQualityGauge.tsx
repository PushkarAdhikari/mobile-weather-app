import { View, Text } from 'react-native';
import { t, Language } from '../utils/i18n';
import { ThemeColors } from '../constants/theme';

function getColor(value: number): string {
  if (value <= 50) return '#22c55e';
  if (value <= 100) return '#eab308';
  if (value <= 150) return '#f97316';
  if (value <= 200) return '#ef4444';
  if (value <= 300) return '#a855f7';
  return '#7f1d1d';
}

function getStatus(value: number, lang: Language): string {
  if (value <= 50) return t('good', lang);
  if (value <= 100) return t('moderate', lang);
  if (value <= 150) return t('unhealthy_sensitive', lang);
  if (value <= 200) return t('unhealthy', lang);
  if (value <= 300) return t('very_unhealthy', lang);
  return t('hazardous', lang);
}

export function AirQualityGauge({ aqi, pm25, pm10, language, colors }: { aqi: number; pm25: number; pm10: number; language: Language; colors: ThemeColors }) {
  const color = getColor(aqi);

  return (
    <View style={{ alignItems: 'center', paddingVertical: 8 }}>
      <View style={{ width: 120, height: 120, borderRadius: 60, borderWidth: 8, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.text.primary, fontSize: 36, fontWeight: '700' }}>{aqi}</Text>
      </View>
      <Text style={{ color, fontSize: 15, fontWeight: '600', marginTop: 8, textAlign: 'center' }}>{getStatus(aqi, language)}</Text>
      <View style={{ flexDirection: 'row', gap: 24, marginTop: 8 }}>
        <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>PM2.5: {pm25}</Text>
        <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>PM10: {pm10}</Text>
      </View>
    </View>
  );
}
