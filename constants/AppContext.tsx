import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TemperatureUnit, WindUnit, PressureUnit, Location } from '../types/weather';
import { saveSettings, loadSettings } from '../utils/storage';
import { requestNotificationPermissions } from '../utils/notifications';
import { Language } from '../utils/i18n';

type ThemeMode = 'dark' | 'light';
type DistanceUnit = 'km' | 'mi';
type RefreshInterval = 15 | 30 | 60;

interface AppContextType {
  unit: TemperatureUnit;
  setUnit: (unit: TemperatureUnit) => void;
  selectedLocation: Location | null;
  setSelectedLocation: (loc: Location | null) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  windUnit: WindUnit;
  setWindUnit: (unit: WindUnit) => void;
  pressureUnit: PressureUnit;
  setPressureUnit: (unit: PressureUnit) => void;
  distanceUnit: DistanceUnit;
  setDistanceUnit: (unit: DistanceUnit) => void;
  refreshInterval: RefreshInterval;
  setRefreshInterval: (interval: RefreshInterval) => void;
  severeAlerts: boolean;
  setSevereAlerts: (enabled: boolean) => void;
  dailyForecastNotify: boolean;
  setDailyForecastNotify: (enabled: boolean) => void;
  precipWarnings: boolean;
  setPrecipWarnings: (enabled: boolean) => void;
  autoDetectLocation: boolean;
  setAutoDetectLocation: (enabled: boolean) => void;
  showFeelsLike: boolean;
  setShowFeelsLike: (enabled: boolean) => void;
  use24hour: boolean;
  setUse24hour: (enabled: boolean) => void;
  useCellularData: boolean;
  setUseCellularData: (enabled: boolean) => void;
  analyticsConsent: boolean;
  setAnalyticsConsent: (enabled: boolean) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const AppContext = createContext<AppContextType>({
  unit: 'celsius',
  setUnit: () => {},
  selectedLocation: null,
  setSelectedLocation: () => {},
  theme: 'dark',
  setTheme: () => {},
  windUnit: 'kmh',
  setWindUnit: () => {},
  pressureUnit: 'hpa',
  setPressureUnit: () => {},
  distanceUnit: 'km',
  setDistanceUnit: () => {},
  refreshInterval: 30,
  setRefreshInterval: () => {},
  severeAlerts: true,
  setSevereAlerts: () => {},
  dailyForecastNotify: false,
  setDailyForecastNotify: () => {},
  precipWarnings: true,
  setPrecipWarnings: () => {},
  autoDetectLocation: true,
  setAutoDetectLocation: () => {},
  showFeelsLike: true,
  setShowFeelsLike: () => {},
  use24hour: false,
  setUse24hour: () => {},
  useCellularData: true,
  setUseCellularData: () => {},
  analyticsConsent: false,
  setAnalyticsConsent: () => {},
  language: 'en',
  setLanguage: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [unit, setUnit] = useState<TemperatureUnit>('celsius');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [windUnit, setWindUnit] = useState<WindUnit>('kmh');
  const [pressureUnit, setPressureUnit] = useState<PressureUnit>('hpa');
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>('km');
  const [refreshInterval, setRefreshInterval] = useState<RefreshInterval>(30);
  const [severeAlerts, setSevereAlerts] = useState(true);
  const [dailyForecastNotify, setDailyForecastNotify] = useState(false);
  const [precipWarnings, setPrecipWarnings] = useState(true);
  const [autoDetectLocation, setAutoDetectLocation] = useState(true);
  const [showFeelsLike, setShowFeelsLike] = useState(true);
  const [use24hour, setUse24hour] = useState(false);
  const [useCellularData, setUseCellularData] = useState(true);
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    requestNotificationPermissions();
    loadSettings().then((saved) => {
      if (saved.unit) setUnit(saved.unit as TemperatureUnit);
      if (saved.windUnit) setWindUnit(saved.windUnit as WindUnit);
      if (saved.pressureUnit) setPressureUnit(saved.pressureUnit as PressureUnit);
      if (saved.theme) setTheme(saved.theme as ThemeMode);
      if (saved.distanceUnit) setDistanceUnit(saved.distanceUnit as DistanceUnit);
      if (saved.refreshInterval !== undefined) setRefreshInterval(saved.refreshInterval as RefreshInterval);
      if (saved.severeAlerts !== undefined) setSevereAlerts(saved.severeAlerts);
      if (saved.dailyForecastNotify !== undefined) setDailyForecastNotify(saved.dailyForecastNotify);
      if (saved.precipWarnings !== undefined) setPrecipWarnings(saved.precipWarnings);
      if (saved.autoDetectLocation !== undefined) setAutoDetectLocation(saved.autoDetectLocation);
      if (saved.showFeelsLike !== undefined) setShowFeelsLike(saved.showFeelsLike);
      if (saved.use24hour !== undefined) setUse24hour(saved.use24hour);
      if (saved.useCellularData !== undefined) setUseCellularData(saved.useCellularData);
      if (saved.analyticsConsent !== undefined) setAnalyticsConsent(saved.analyticsConsent);
      if (saved.selectedLocation) setSelectedLocation(saved.selectedLocation as Location);
      if (saved.language) setLanguage(saved.language as Language);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveSettings({
      unit, windUnit, pressureUnit, theme, distanceUnit,
      refreshInterval, severeAlerts, dailyForecastNotify,
      precipWarnings, autoDetectLocation, showFeelsLike,
      use24hour, useCellularData, analyticsConsent,
      selectedLocation, language,
    });
  }, [
    loaded, unit, windUnit, pressureUnit, theme, distanceUnit,
    refreshInterval, severeAlerts, dailyForecastNotify,
    precipWarnings, autoDetectLocation, showFeelsLike,
    use24hour, useCellularData, analyticsConsent, selectedLocation, language,
  ]);

  return (
    <AppContext.Provider
      value={{
        unit, setUnit,
        selectedLocation, setSelectedLocation,
        theme, setTheme,
        windUnit, setWindUnit,
        pressureUnit, setPressureUnit,
        distanceUnit, setDistanceUnit,
        refreshInterval, setRefreshInterval,
        severeAlerts, setSevereAlerts,
        dailyForecastNotify, setDailyForecastNotify,
        precipWarnings, setPrecipWarnings,
        autoDetectLocation, setAutoDetectLocation,
        showFeelsLike, setShowFeelsLike,
        use24hour, setUse24hour,
        useCellularData, setUseCellularData,
        analyticsConsent, setAnalyticsConsent,
        language, setLanguage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
