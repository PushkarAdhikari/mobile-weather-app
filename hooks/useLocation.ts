import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Location as LocationType } from '../types/weather';

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

        setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });

        const geocode = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });

        if (geocode.length > 0) {
          setCityName(geocode[0].city || geocode[0].region || 'Unknown');
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
