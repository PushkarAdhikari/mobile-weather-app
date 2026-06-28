import { LinearGradient } from 'expo-linear-gradient';
import { getWeatherGradient } from '../utils/weather';

interface GradientBackgroundProps {
  isDay: number;
  weatherCode: number;
  children: React.ReactNode;
}

export function GradientBackground({ isDay, weatherCode, children }: GradientBackgroundProps) {
  const colors = getWeatherGradient(isDay, weatherCode);

  return (
    <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={{ flex: 1 }}>
      {children}
    </LinearGradient>
  );
}
