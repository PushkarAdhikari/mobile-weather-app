import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export function useLocation() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cityName, setCityName] = useState<string>('');

  useEffect(() => {
    let mounted = true;

    async function requestLocation() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Location permission denied');
          setLoading(false);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        if (!mounted) return;
        const { latitude, longitude } = loc.coords;

        setLocation({ lat: latitude, lng: longitude });

        try {
          const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
          const name = geocode.length > 0
            ? (geocode[0].city || geocode[0].district || geocode[0].region || geocode[0].country || '')
            : `${latitude.toFixed(1)}°, ${longitude.toFixed(1)}°`;
          if (mounted) setCityName(name);
        } catch {
          if (mounted) setCityName(`${latitude.toFixed(1)}°, ${longitude.toFixed(1)}°`);
        }
      } catch (err) {
        if (mounted) setError('Failed to get location');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    requestLocation();

    return () => { mounted = false; };
  }, []);

  return { location, error, loading, cityName };
}
