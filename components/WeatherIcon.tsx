import { Text, View } from 'react-native';

const WEATHER_EMOJI: Record<number, string> = {
  1000: '☀️',
  1003: '🌤',
  1006: '☁️',
  1009: '☁️',
  1030: '🌫',
  1063: '🌦',
  1066: '🌨',
  1069: '🌨',
  1072: '🌧',
  1087: '⛈',
  1114: '🌨',
  1117: '🌨',
  1135: '🌫',
  1147: '🌫',
  1150: '🌦',
  1153: '🌦',
  1168: '🌧',
  1171: '🌧',
  1180: '🌦',
  1183: '🌦',
  1186: '🌧',
  1189: '🌧',
  1192: '🌧',
  1195: '🌧',
  1198: '🌧',
  1201: '🌧',
  1204: '🌨',
  1207: '🌨',
  1210: '🌨',
  1213: '🌨',
  1216: '🌨',
  1219: '🌨',
  1222: '🌨',
  1225: '🌨',
  1237: '🌨',
  1240: '🌦',
  1243: '🌧',
  1246: '🌧',
  1249: '🌨',
  1252: '🌨',
  1255: '🌨',
  1258: '🌨',
  1261: '🌨',
  1264: '🌨',
  1273: '⛈',
  1276: '⛈',
  1279: '⛈',
  1282: '⛈',
};

const WEATHER_TEXT: Record<number, string> = {
  1000: 'Sunny',
  1003: 'Partly Cloudy',
  1006: 'Cloudy',
  1009: 'Overcast',
  1030: 'Foggy',
  1063: 'Rain',
  1066: 'Snow',
  1069: 'Sleet',
  1072: 'Freezing Rain',
  1087: 'Thunderstorm',
  1135: 'Foggy',
  1147: 'Foggy',
  1150: 'Light Drizzle',
  1153: 'Drizzle',
  1168: 'Freezing Drizzle',
  1171: 'Freezing Drizzle',
  1180: 'Light Rain',
  1183: 'Rain',
  1186: 'Rain',
  1189: 'Rain',
  1192: 'Heavy Rain',
  1195: 'Heavy Rain',
  1198: 'Freezing Rain',
  1201: 'Freezing Rain',
  1204: 'Sleet',
  1207: 'Sleet',
  1210: 'Light Snow',
  1213: 'Snow',
  1216: 'Snow',
  1219: 'Snow',
  1222: 'Heavy Snow',
  1225: 'Heavy Snow',
  1237: 'Hail',
  1240: 'Light Rain',
  1243: 'Heavy Rain',
  1246: 'Heavy Rain',
  1249: 'Sleet',
  1252: 'Sleet',
  1255: 'Light Snow',
  1258: 'Snow',
  1261: 'Heavy Snow',
  1264: 'Heavy Snow',
  1273: 'Thunderstorm',
  1276: 'Thunderstorm',
  1279: 'Thunderstorm',
  1282: 'Thunderstorm',
};

interface WeatherIconProps {
  icon?: string;
  code?: number;
  size?: number;
  showLabel?: boolean;
}

export function WeatherIcon({ icon: _icon, code, size = 64, showLabel }: WeatherIconProps) {
  const emoji = code !== undefined ? (WEATHER_EMOJI[code] ?? '🌤') : '🌤';
  const label = code !== undefined ? (WEATHER_TEXT[code] ?? '') : '';

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      <Text style={{ fontSize: size * 0.7 }}>{emoji}</Text>
      {showLabel && <Text style={{ fontSize: 10, color: '#fff', marginTop: 2 }}>{label}</Text>}
    </View>
  );
}

export function getWeatherEmoji(code: number): string {
  return WEATHER_EMOJI[code] ?? '🌤';
}
