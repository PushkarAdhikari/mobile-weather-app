import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getWeatherGradient } from '../utils/weather';
import { getThemeColors } from '../constants/theme';
import { WeatherEffects } from './WeatherEffects';

interface GradientBackgroundProps {
  isDay: number;
  weatherCode: number;
  theme: 'dark' | 'light';
  children: React.ReactNode;
}

export function GradientBackground({ isDay, weatherCode, theme, children }: GradientBackgroundProps) {
  const colors = getThemeColors(theme);

  if (theme === 'light') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {children}
      </View>
    );
  }

  const gradient = getWeatherGradient(isDay, weatherCode);

  return (
    <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={{ flex: 1 }}>
      <WeatherEffects weatherCode={weatherCode} isDay={isDay} />
      {children}
    </LinearGradient>
  );
}
