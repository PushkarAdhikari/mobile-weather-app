import { OPEN_METEO_BASE_URL, GEOCODING_BASE_URL, NWS_BASE_URL } from '../constants/api';
import { WeatherData, Location, HourlyForecast, DailyForecast, WeatherAlert } from '../types/weather';

const WMO_TEXT: Record<number, string> = {
  0: 'Clear', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Depositing rime fog',
  51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
  56: 'Light freezing drizzle', 57: 'Dense freezing drizzle',
  61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
  66: 'Light freezing rain', 67: 'Heavy freezing rain',
  71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
  85: 'Slight snow showers', 86: 'Heavy snow showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail',
};

const WMO_ICON_NUM: Record<number, number> = {
  0: 113, 1: 116, 2: 119, 3: 122,
  45: 143, 48: 143,
  51: 176, 53: 176, 55: 176,
  56: 182, 57: 182,
  61: 176, 63: 182, 65: 185,
  66: 182, 67: 185,
  71: 179, 73: 179, 75: 179,
  77: 179,
  80: 296, 81: 299, 82: 302,
  85: 323, 86: 326,
  95: 389, 96: 392, 99: 392,
};

const WMO_WEATHERAPI_CODE: Record<number, number> = {
  0: 1000, 1: 1003, 2: 1006, 3: 1009,
  45: 1030, 48: 1030,
  51: 1150, 53: 1153, 55: 1168,
  56: 1168, 57: 1171,
  61: 1063, 63: 1189, 65: 1192,
  66: 1198, 67: 1201,
  71: 1213, 73: 1219, 75: 1225,
  77: 1237,
  80: 1240, 81: 1243, 82: 1246,
  85: 1255, 86: 1261,
  95: 1273, 96: 1276, 99: 1276,
};

function wmoCondition(wmoCode: number, isDay: number): { text: string; icon: string; code: number } {
  const code = WMO_WEATHERAPI_CODE[wmoCode] ?? 1000;
  const iconNum = WMO_ICON_NUM[wmoCode] ?? 113;
  const dayNight = isDay ? 'day' : 'night';
  return {
    text: WMO_TEXT[wmoCode] ?? 'Unknown',
    icon: `//cdn.weatherapi.com/weather/64x64/${dayNight}/${iconNum}.png`,
    code,
  };
}

function degreesToDir(deg: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    uv_index: number;
    is_day: number;
    precipitation: number;
    cloud_cover: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    apparent_temperature: number[];
    precipitation_probability: number[];
    weather_code: number[];
    wind_speed_10m: number[];
    uv_index: number[];
    relative_humidity_2m: number[];
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    temperature_2m_mean: number[];
    apparent_temperature_max: number[];
    apparent_temperature_min: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
    weather_code: number[];
    wind_speed_10m_max: number[];
    wind_gusts_10m_max: number[];
    uv_index_max: number[];
    sunrise: string[];
    sunset: string[];
  };
}

function transformOpenMeteoData(raw: OpenMeteoResponse): WeatherData {
  const { current, hourly, daily } = raw;
  const isDay = current.is_day;

  const cond = wmoCondition(current.weather_code, isDay);

  const forecastday: DailyForecast[] = daily.time.map((date, i) => {
    const dayCond = wmoCondition(daily.weather_code[i], 1);
    const hours: HourlyForecast[] = [];
    for (let h = i * 24; h < (i + 1) * 24 && h < hourly.time.length; h++) {
      const hCond = wmoCondition(hourly.weather_code[h], 1);
      hours.push({
        time: hourly.time[h],
        temp_c: hourly.temperature_2m[h],
        temp_f: Math.round(hourly.temperature_2m[h] * 9 / 5 + 32),
        condition: hCond,
        chance_of_rain: hourly.precipitation_probability[h] ?? 0,
        wind_kph: hourly.wind_speed_10m[h] ?? 0,
        humidity: hourly.relative_humidity_2m[h] ?? 50,
        uv: hourly.uv_index[h] ?? 0,
      });
    }

    return {
      date,
      day: {
        maxtemp_c: daily.temperature_2m_max[i],
        maxtemp_f: Math.round(daily.temperature_2m_max[i] * 9 / 5 + 32),
        mintemp_c: daily.temperature_2m_min[i],
        mintemp_f: Math.round(daily.temperature_2m_min[i] * 9 / 5 + 32),
        avgtemp_c: daily.temperature_2m_mean[i],
        avgtemp_f: Math.round(daily.temperature_2m_mean[i] * 9 / 5 + 32),
        condition: dayCond,
        daily_chance_of_rain: daily.precipitation_probability_max[i] ?? 0,
        maxwind_kph: daily.wind_speed_10m_max[i] ?? 0,
        avghumidity: 60,
        uv: daily.uv_index_max[i] ?? 0,
      },
      astro: {
        sunrise: daily.sunrise[i] ? formatTime(daily.sunrise[i]) : '',
        sunset: daily.sunset[i] ? formatTime(daily.sunset[i]) : '',
        moon_phase: '',
      },
      hour: hours,
    };
  });

  return {
    location: {
      name: '',
      region: '',
      country: '',
      lat: raw.latitude,
      lon: raw.longitude,
      localtime: current.time,
    },
    current: {
      temp_c: current.temperature_2m,
      temp_f: Math.round(current.temperature_2m * 9 / 5 + 32),
      feelslike_c: current.apparent_temperature,
      feelslike_f: Math.round(current.apparent_temperature * 9 / 5 + 32),
      condition: cond,
      wind_mph: Math.round(current.wind_speed_10m * 0.621371),
      wind_kph: current.wind_speed_10m,
      wind_dir: degreesToDir(current.wind_direction_10m),
      humidity: current.relative_humidity_2m,
      cloud: current.cloud_cover,
      uv: Math.round(current.uv_index),
      gust_mph: 0,
      gust_kph: 0,
      precip_mm: current.precipitation,
      vis_km: 10,
      last_updated: current.time,
      is_day: current.is_day,
    },
    forecast: { forecastday },
    alerts: { alert: generateAlerts(current, daily) },
  };
}

function generateAlerts(current: OpenMeteoResponse['current'], daily: OpenMeteoResponse['daily']): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const code = current.weather_code;
  const now = current.time;
  const expiry = new Date(new Date(now).getTime() + 24 * 60 * 60 * 1000).toISOString();

  if (code >= 95 && code <= 99) {
    alerts.push({
      headline: 'Thunderstorm Warning in Effect',
      severity: 'Severe',
      urgency: 'Immediate',
      areas: 'Local Area',
      category: 'Thunderstorm',
      effective: now,
      expires: expiry,
      desc: 'A thunderstorm is currently active in your area. Expect heavy rain, frequent lightning, and strong wind gusts. Seek shelter indoors and avoid open areas, elevated ground, and bodies of water.',
      instruction: 'Stay indoors. Unplug electronics. Avoid using plumbing. If driving, pull over safely and wait for the storm to pass.',
    });
  }

  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {
    const isHeavy = code === 65 || code === 67 || code === 82;
    alerts.push({
      headline: isHeavy ? 'Heavy Rain Advisory' : 'Rain Advisory',
      severity: isHeavy ? 'Moderate' : 'Minor',
      urgency: 'Expected',
      areas: 'Local Area',
      category: 'Rain',
      effective: now,
      expires: expiry,
      desc: isHeavy
        ? 'Heavy rainfall is expected in your area. Localized flooding may occur in low-lying areas and poor drainage locations.'
        : 'Rain is expected in your area. Light to moderate precipitation anticipated throughout the day.',
      instruction: isHeavy
        ? 'Avoid flooded roads. Secure outdoor items. Allow extra travel time.'
        : 'Carry an umbrella. Drive with caution on wet roads.',
    });
  }

  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    alerts.push({
      headline: 'Snow Advisory',
      severity: 'Moderate',
      urgency: 'Expected',
      areas: 'Local Area',
      category: 'Snow',
      effective: now,
      expires: expiry,
      desc: 'Snowfall is expected in your area. Accumulations may make travel difficult. Roads could become slippery and visibility may be reduced.',
      instruction: 'Drive slowly. Keep emergency kit in vehicle. Dress warmly if going outside.',
    });
  }

  if ((code >= 45 && code <= 48)) {
    alerts.push({
      headline: 'Fog Advisory',
      severity: 'Minor',
      urgency: 'Expected',
      areas: 'Local Area',
      category: 'Fog',
      effective: now,
      expires: expiry,
      desc: 'Dense fog is reducing visibility in your area. Travel conditions may be hazardous, especially on highways and bridges.',
      instruction: 'Use low beam headlights. Reduce speed. Increase following distance.',
    });
  }

  if (daily && daily.wind_speed_10m_max && daily.wind_speed_10m_max.some((w) => w > 50)) {
    alerts.push({
      headline: 'Wind Advisory',
      severity: 'Moderate',
      urgency: 'Expected',
      areas: 'Local Area',
      category: 'Wind',
      effective: now,
      expires: expiry,
      desc: 'Strong winds are forecast in your area. Gusts may cause minor damage to unsecured objects and make driving difficult for high-profile vehicles.',
      instruction: 'Secure outdoor furniture. Avoid parking under trees. Use caution when driving.',
    });
  }

  return alerts;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

async function fetchNWSAlerts(lat: number, lng: number): Promise<WeatherAlert[]> {
  try {
    const url = `${NWS_BASE_URL}/alerts/active?point=${lat},${lng}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'WeatherApp/2.1 (pushkar@example.com)' },
    });
    if (!response.ok) return [];
    const data = await response.json();
    if (!data.features) return [];

    return data.features.map((f: any): WeatherAlert => ({
      headline: f.properties.headline || f.properties.event || 'Weather Alert',
      severity: f.properties.severity || 'Unknown',
      urgency: f.properties.urgency || 'Unknown',
      areas: f.properties.areaDesc || 'Local Area',
      category: f.properties.category || 'Weather',
      effective: f.properties.effective || '',
      expires: f.properties.expires || '',
      desc: f.properties.description || '',
      instruction: f.properties.instruction || '',
    }));
  } catch {
    return [];
  }
}

export async function getCurrentWeather(lat: number, lng: number): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,uv_index,is_day,precipitation,cloud_cover',
    hourly: 'temperature_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m,uv_index,relative_humidity_2m',
    daily: 'temperature_2m_max,temperature_2m_min,temperature_2m_mean,apparent_temperature_max,apparent_temperature_min,precipitation_sum,precipitation_probability_max,weather_code,wind_speed_10m_max,wind_gusts_10m_max,uv_index_max,sunrise,sunset',
    timezone: 'auto',
    forecast_days: '7',
  });

  const url = `${OPEN_METEO_BASE_URL}/forecast?${params}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Open-Meteo error: ${response.status}`);
  }

  const raw: OpenMeteoResponse = await response.json();
  const data = transformOpenMeteoData(raw);

  const [nwsAlerts] = await Promise.all([
    fetchNWSAlerts(lat, lng),
  ]);

  if (nwsAlerts.length > 0) {
    data.alerts = { alert: nwsAlerts };
  }

  return data;
}

export async function searchCities(query: string): Promise<Location[]> {
  const url = `${GEOCODING_BASE_URL}/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`;
  const response = await fetch(url);

  if (!response.ok) return [];

  const data = await response.json();
  if (!data.results) return [];

  return data.results.map((item: any) => ({
    lat: item.latitude,
    lng: item.longitude,
    name: item.name,
    region: item.admin1 || '',
    country: item.country || '',
  }));
}

export async function fetchWeatherByCity(city: string): Promise<WeatherData> {
  const coords = await geoCodeCity(city);
  return getCurrentWeather(coords.lat, coords.lng);
}

async function geoCodeCity(city: string): Promise<{ lat: number; lng: number }> {
  const url = `${GEOCODING_BASE_URL}/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Geocoding failed');
  const data = await response.json();
  if (!data.results?.[0]) throw new Error('City not found');
  return { lat: data.results[0].latitude, lng: data.results[0].longitude };
}
