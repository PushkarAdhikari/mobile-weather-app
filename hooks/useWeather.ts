import { useQuery } from '@tanstack/react-query';
import { getCurrentWeather } from '../services/api';
import { getCachedData, setCachedData } from '../services/cache';
import { WeatherData } from '../types/weather';

export function useWeather(lat: number | null, lng: number | null) {
  return useQuery<WeatherData>({
    queryKey: ['weather', lat, lng],
    queryFn: async () => {
      if (lat === null || lng === null) throw new Error('No location');

      const cached = await getCachedData<WeatherData>(`weather_${lat}_${lng}`);
      if (cached) return cached;

      const data = await getCurrentWeather(lat, lng);
      await setCachedData(`weather_${lat}_${lng}`, data);
      return data;
    },
    enabled: lat !== null && lng !== null,
    staleTime: 1000 * 60 * 30,
    retry: 2,
  });
}
