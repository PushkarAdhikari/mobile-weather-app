export interface Location {
  lat: number;
  lng: number;
  name: string;
  region?: string;
  country?: string;
}

export interface CurrentWeather {
  temp_c: number;
  temp_f: number;
  feelslike_c: number;
  feelslike_f: number;
  condition: Condition;
  wind_mph: number;
  wind_kph: number;
  wind_dir: string;
  humidity: number;
  cloud: number;
  uv: number;
  gust_mph: number;
  gust_kph: number;
  precip_mm: number;
  vis_km: number;
  last_updated: string;
  is_day: number;
}

export interface Condition {
  text: string;
  icon: string;
  code: number;
}

export interface HourlyForecast {
  time: string;
  temp_c: number;
  temp_f: number;
  condition: Condition;
  chance_of_rain: number;
  wind_kph: number;
  humidity: number;
  uv: number;
}

export interface DailyForecast {
  date: string;
  day: {
    maxtemp_c: number;
    maxtemp_f: number;
    mintemp_c: number;
    mintemp_f: number;
    avgtemp_c: number;
    avgtemp_f: number;
    condition: Condition;
    daily_chance_of_rain: number;
    maxwind_kph: number;
    avghumidity: number;
    uv: number;
  };
  astro: {
    sunrise: string;
    sunset: string;
    moon_phase: string;
  };
  hour: HourlyForecast[];
}

export interface WeatherAlert {
  headline: string;
  severity: string;
  urgency: string;
  areas: string;
  category: string;
  effective: string;
  expires: string;
  desc: string;
  instruction: string;
}

export interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    localtime: string;
  };
  current: CurrentWeather;
  forecast: {
    forecastday: DailyForecast[];
  };
  alerts?: {
    alert: WeatherAlert[];
  };
}

export type TemperatureUnit = 'celsius' | 'fahrenheit';
