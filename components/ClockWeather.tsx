"use client";

import { useEffect, useState } from "react";

interface WeatherData {
  temp: number;
  label: string;
  icon: string;
}

const WEATHER_CACHE_KEY = "jsnotes:weather";
const WEATHER_TTL_MS = 30 * 60 * 1000;

function useClock(): Date | null {
  // Starts null so the server and the first client render agree (no
  // hydration mismatch), then ticks once mounted.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    // Deferred rather than called directly in the effect body — a
    // synchronous setState here would cascade into an extra render.
    const kick = setTimeout(tick, 0);
    const id = setInterval(tick, 1000 * 15);
    return () => {
      clearTimeout(kick);
      clearInterval(id);
    };
  }, []);
  return now;
}

function useWeather(): WeatherData | "denied" | null {
  const [weather, setWeather] = useState<WeatherData | "denied" | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(WEATHER_CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw) as { at: number; data: WeatherData };
        if (Date.now() - cached.at < WEATHER_TTL_MS) {
          // Deferred — see useClock above for why.
          const kick = setTimeout(() => setWeather(cached.data), 0);
          return () => clearTimeout(kick);
        }
      }
    } catch {
      // ignore a corrupt cache entry and just fetch fresh
    }

    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetch(`/api/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`)
          .then((r) => r.json())
          .then((data: WeatherData & { error?: string }) => {
            if (data.error) return;
            setWeather(data);
            try {
              localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({ at: Date.now(), data }));
            } catch {
              // localStorage full/blocked — weather still shows for this visit
            }
          })
          .catch(() => {});
      },
      () => setWeather("denied"),
      { timeout: 8000, maximumAge: WEATHER_TTL_MS }
    );
  }, []);

  return weather;
}

/** A small always-on clock + (opt-in, geolocated) weather readout for the
 * sidebar — ambient, not interactive. Weather silently does nothing if
 * location is denied or unavailable, rather than nagging about it. */
export function ClockWeather() {
  const now = useClock();
  const weather = useWeather();

  if (!now) return null;

  const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const day = now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className="clock-weather">
      <div className="clock-weather__time">{time}</div>
      <div className="clock-weather__day">{day}</div>
      {weather && weather !== "denied" && (
        <div className="clock-weather__weather" title={weather.label}>
          <span aria-hidden="true">{weather.icon}</span> {weather.temp}°C
        </div>
      )}
    </div>
  );
}
