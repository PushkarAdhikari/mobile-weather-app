import { createContext, useContext, useState, ReactNode } from 'react';
import { TemperatureUnit, WindUnit, Location } from '../types/weather';

type ThemeMode = 'dark' | 'light';
type PressureUnit = 'hpa' | 'inhg' | 'mmhg';
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
});

export function AppProvider({ children }: { children: ReactNode }) {
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
