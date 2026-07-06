import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@weather_app/settings';

export interface PersistedSettings {
  unit: string;
  windUnit: string;
  pressureUnit: string;
  theme: string;
  distanceUnit: string;
  refreshInterval: number;
  severeAlerts: boolean;
  dailyForecastNotify: boolean;
  precipWarnings: boolean;
  autoDetectLocation: boolean;
  showFeelsLike: boolean;
  use24hour: boolean;
  useCellularData: boolean;
  analyticsConsent: boolean;
  selectedLocation: { lat: number; lng: number; name: string; region?: string; country?: string } | null;
  language: string;
}

export async function saveSettings(settings: Partial<PersistedSettings>): Promise<void> {
  const existing = await loadSettings();
  const merged = { ...existing, ...settings };
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
}

export async function loadSettings(): Promise<Partial<PersistedSettings>> {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  if (!raw) return {};
  return JSON.parse(raw);
}

export async function clearSettings(): Promise<void> {
  await AsyncStorage.removeItem(SETTINGS_KEY);
}
