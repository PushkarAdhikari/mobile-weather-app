import { TemperatureUnit } from '../types/weather';

export function getWeatherGradient(isDay: number, code: number): [string, string] {
  if (!isDay) return ['#0f172a', '#1e293b'];

  if (code >= 1000 && code <= 1003) return ['#1e3a5f', '#2563eb'];
  if (code >= 1004 && code <= 1009) return ['#334155', '#475569'];
  if (code >= 1030 && code <= 1035) return ['#1e293b', '#334155'];
  if (code >= 1063 && code <= 1171) return ['#1e3a5f', '#0f172a'];
  if (code >= 1201 && code <= 1237) return ['#1a1a2e', '#0f3460'];
  if (code >= 1240 && code <= 1246) return ['#1e3a5f', '#0f172a'];
  if (code >= 1249 && code <= 1264) return ['#1e293b', '#0f172a'];
  if (code >= 1273 && code <= 1282) return ['#0f172a', '#16213e'];
  return ['#1e3a5f', '#2563eb'];
}

export function formatTemp(tempC: number, tempF: number, unit: TemperatureUnit): number {
  return unit === 'celsius' ? Math.round(tempC) : Math.round(tempF);
}

export function formatWindSpeed(kph: number, unit: TemperatureUnit): string {
  if (unit === 'celsius') return `${Math.round(kph)} km/h`;
  return `${Math.round(kph * 0.621371)} mph`;
}

export function getDayName(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

export function getHourFromTime(time: string, use24hour = false): string {
  const date = new Date(time.replace(' ', 'T'));
  if (isNaN(date.getTime())) return time;
  return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: !use24hour });
}

export function getTimeFromDate(dateStr: string, use24hour = false): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: !use24hour,
  });
}

export function getClosestHourIndex(hours: any[]): number {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();

  return hours.findIndex((h: any) => {
    const hourDate = new Date(h.time.replace(' ', 'T'));
    return hourDate.getHours() >= currentHour && hourDate.getMinutes() >= 0;
  });
}

export function formatHourlyTime(time: string, index: number, use24hour = false): string {
  if (index === 0) return 'Now';
  const date = new Date(time.replace(' ', 'T'));
  if (isNaN(date.getTime())) return time;
  return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: !use24hour });
}

export function isDayTime(): boolean {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}


