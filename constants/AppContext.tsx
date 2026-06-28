import { createContext, useContext, useState, ReactNode } from 'react';
import { TemperatureUnit, Location } from '../types/weather';

interface AppContextType {
  unit: TemperatureUnit;
  setUnit: (unit: TemperatureUnit) => void;
  selectedLocation: Location | null;
  setSelectedLocation: (loc: Location | null) => void;
}

const AppContext = createContext<AppContextType>({
  unit: 'celsius',
  setUnit: () => {},
  selectedLocation: null,
  setSelectedLocation: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [unit, setUnit] = useState<TemperatureUnit>('celsius');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  return (
    <AppContext.Provider value={{ unit, setUnit, selectedLocation, setSelectedLocation }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
