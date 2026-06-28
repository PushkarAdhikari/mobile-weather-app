import AsyncStorage from '@react-native-async-storage/async-storage';
import { CACHE_DURATION_MS } from '../constants/api';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;

    const entry: CacheEntry<T> = JSON.parse(raw);
    const isExpired = Date.now() - entry.timestamp > CACHE_DURATION_MS;

    if (isExpired) {
      await AsyncStorage.removeItem(key);
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

export async function setCachedData<T>(key: string, data: T): Promise<void> {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(entry));
  } catch {
  }
}

export async function getCachedDataWithAge<T>(key: string): Promise<{ data: T | null; age: number | null }> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return { data: null, age: null };

    const entry: CacheEntry<T> = JSON.parse(raw);
    const age = Date.now() - entry.timestamp;

    if (age > CACHE_DURATION_MS) {
      return { data: entry.data, age };
    }

    return { data: entry.data, age };
  } catch {
    return { data: null, age: null };
  }
}

export async function clearCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const weatherKeys = keys.filter(k => k.startsWith('weather_'));
    await AsyncStorage.multiRemove(weatherKeys);
  } catch {
  }
}
