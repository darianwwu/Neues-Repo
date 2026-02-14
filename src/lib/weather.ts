import type { WeatherKind, WeatherNow } from './types';

const OPENWEATHER_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY as string | undefined;

function mapKind(main: string): WeatherKind {
  const m = (main || '').toLowerCase();
  if (m === 'clear') return 'Clear';
  if (m === 'clouds') return 'Clouds';
  if (m === 'rain') return 'Rain';
  if (m === 'drizzle') return 'Drizzle';
  if (m === 'thunderstorm') return 'Thunderstorm';
  if (m === 'snow') return 'Snow';
  if (m === 'mist' || m === 'fog' || m === 'haze' || m === 'smoke' || m === 'dust') return 'Fog';
  return 'Other';
}

export type Coords = { lat: number; lon: number };

export async function fetchWeatherNow(coords: Coords): Promise<WeatherNow> {
  if (!OPENWEATHER_KEY) {
    throw new Error('Missing VITE_OPENWEATHER_API_KEY');
  }

  const url = new URL('https://api.openweathermap.org/data/2.5/weather');
  url.searchParams.set('lat', String(coords.lat));
  url.searchParams.set('lon', String(coords.lon));
  url.searchParams.set('appid', OPENWEATHER_KEY);
  url.searchParams.set('units', 'metric');
  url.searchParams.set('lang', 'de');

  const res = await fetch(url.toString());
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenWeather error: ${res.status} ${text}`);
  }

  const data = await res.json();
  const main = data.weather?.[0]?.main ?? 'Other';
  const description = data.weather?.[0]?.description ?? '';
  const icon = data.weather?.[0]?.icon ?? null;

  return {
    tempC: Math.round(data.main?.temp ?? 0),
    feelsLikeC: Math.round(data.main?.feels_like ?? (data.main?.temp ?? 0)),
    kind: mapKind(main),
    description,
    icon,
    windMs: Number(data.wind?.speed ?? 0),
    humidity: Number(data.main?.humidity ?? 0),
    locationName: String(data.name ?? 'Dein Standort'),
    rainMm1h: data.rain?.['1h'] != null ? Number(data.rain['1h']) : undefined,
    snowMm1h: data.snow?.['1h'] != null ? Number(data.snow['1h']) : undefined
  };
}

export function getDefaultCoords(): Coords {
  // Berlin as a sensible fallback
  return { lat: 52.52, lon: 13.405 };
}

export async function getCoordsFromBrowser(): Promise<Coords> {
  const cached = localStorage.getItem('oo:coords');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (typeof parsed?.lat === 'number' && typeof parsed?.lon === 'number') {
        return parsed;
      }
    } catch {
      // ignore
    }
  }

  if (!('geolocation' in navigator)) {
    const d = getDefaultCoords();
    localStorage.setItem('oo:coords', JSON.stringify(d));
    return d;
  }

  const coords = await new Promise<Coords>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }).catch(() => getDefaultCoords());

  localStorage.setItem('oo:coords', JSON.stringify(coords));
  return coords;
}
