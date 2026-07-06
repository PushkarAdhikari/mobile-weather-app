import { TemperatureUnit, WindUnit, PressureUnit } from '../types/weather';

export function shiftHex(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `rgb(${r},${g},${b})`;
}

export function shiftGradient(gradient: [string, string], amount: number): [string, string] {
  return [shiftHex(gradient[0], amount), shiftHex(gradient[1], amount)];
}

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

export function formatWindSpeed(kph: number, unit: WindUnit): string {
  if (unit === 'kmh') return `${Math.round(kph)} km/h`;
  return `${Math.round(kph * 0.621371)} mph`;
}

export function formatPressure(hpa: number, unit: PressureUnit): string {
  if (unit === 'hpa') return `${Math.round(hpa)} hPa`;
  if (unit === 'inhg') return `${(hpa * 0.02953).toFixed(2)} inHg`;
  return `${Math.round(hpa * 0.75006)} mmHg`;
}

export function formatVisibility(km: number): string {
  return `${km} km`;
}

export function getDayName(dateStr: string, lang: string = 'en'): string {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return lang === 'en' ? 'Today' : lang === 'es' ? 'Hoy' : lang === 'fr' ? "Aujourd'hui" : lang === 'de' ? 'Heute' : lang === 'pt' ? 'Hoje' : 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return lang === 'en' ? 'Tomorrow' : lang === 'es' ? 'Mañana' : lang === 'fr' ? 'Demain' : lang === 'de' ? 'Morgen' : lang === 'pt' ? 'Amanhã' : 'Tomorrow';

  try {
    return date.toLocaleDateString(lang === 'en' ? 'en-US' : lang, { weekday: 'long' });
  } catch {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }
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

export function getClosestHourIndex(hours: any[], currentTimeStr?: string): number {
  const currentHour = currentTimeStr
    ? parseInt(currentTimeStr.slice(11, 13), 10)
    : new Date().getHours();

  return hours.findIndex((h: any) => {
    const hourNum = parseInt(h.time?.slice(11, 13), 10);
    return !isNaN(hourNum) && hourNum >= currentHour;
  });
}

export function formatHourlyTime(time: string, index: number, use24hour = false): string {
  if (index === 0) return 'Now';
  const hourNum = parseInt(time?.slice(11, 13), 10);
  if (isNaN(hourNum)) return time;
  if (use24hour) return `${hourNum.toString().padStart(2, '0')}:00`;
  const ampm = hourNum >= 12 ? 'PM' : 'AM';
  const display = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
  return `${display} ${ampm}`;
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

export function parseHour12(timeStr: string): number {
  const parts = timeStr.split(' ');
  const ampm = parts[1] || '';
  const [h] = (parts[0] || '0').split(':');
  let hour = parseInt(h, 10);
  if (ampm.toUpperCase() === 'PM' && hour !== 12) hour += 12;
  if (ampm.toUpperCase() === 'AM' && hour === 12) hour = 0;
  return hour;
}

export function isHourDaytime(hourStr: string, sunriseStr: string, sunsetStr: string): boolean {
  const hour = parseInt(hourStr.slice(11, 13), 10);
  if (!sunriseStr || !sunsetStr) return hour >= 6 && hour < 18;
  const sunrise = parseHour12(sunriseStr);
  const sunset = parseHour12(sunsetStr);
  return hour >= sunrise && hour < sunset;
}


