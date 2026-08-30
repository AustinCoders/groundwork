"use client";

import { useEffect, useState } from "react";
import { KEYS, store } from "@/lib/storage";

interface WeatherData {
  temp: number;
  label: string;
  icon: string;
}

type ClockFormat = "12" | "24";
type Period = "morning" | "afternoon" | "evening" | "night";

const WEATHER_TTL_MS = 30 * 60 * 1000;

const GREETING: Record<Period, { label: string; emoji: string }> = {
  morning: { label: "morning", emoji: "☀️" },
  afternoon: { label: "afternoon", emoji: "🌤️" },
  evening: { label: "evening", emoji: "🌇" },
  night: { label: "night", emoji: "🌙" },
};

function periodOf(hour: number): Period {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

function useClock(): Date | null {
  // Starts null so the server and the first client render agree (no
  // hydration mismatch), then ticks once mounted. Once-a-second so the
  // seconds readout is actually live, not just decorative.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    // Deferred rather than called directly in the effect body — a
    // synchronous setState here would cascade into an extra render.
    const kick = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(kick);
      clearInterval(id);
    };
  }, []);
  return now;
}

function useClockFormat(): [ClockFormat, (next: ClockFormat) => void] {
  const [format, setFormatState] = useState<ClockFormat>("12");
  useEffect(() => {
    const saved = store.get<ClockFormat>(KEYS.clockFormat, "12");
    const kick = setTimeout(() => setFormatState(saved), 0);
    return () => clearTimeout(kick);
  }, []);
  function setFormat(next: ClockFormat) {
    setFormatState(next);
    store.set(KEYS.clockFormat, next);
  }
  return [format, setFormat];
}

type WeatherState = "idle" | "loading" | "denied" | WeatherData;

function useWeather(): [WeatherState, () => void] {
  const [weather, setWeather] = useState<WeatherState>("idle");

  // Only reads a fresh cache on mount — never requests location on its
  // own. A silent background geolocation prompt is easy to miss (or to
  // have dismissed once and forgotten); a click the reader chooses to
  // make is the reliable way to actually get weather showing.
  useEffect(() => {
    const cached = store.get<{ at: number; data: WeatherData } | null>(KEYS.weather, null);
    if (cached && Date.now() - cached.at < WEATHER_TTL_MS) {
      const kick = setTimeout(() => setWeather(cached.data), 0);
      return () => clearTimeout(kick);
    }
  }, []);

  function request() {
    if (!navigator.geolocation) {
      setWeather("denied");
      return;
    }
    setWeather("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetch(`/api/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`)
          .then((r) => r.json())
          .then((data: WeatherData & { error?: string }) => {
            if (data.error) {
              setWeather("denied");
              return;
            }
            setWeather(data);
            store.set(KEYS.weather, { at: Date.now(), data });
          })
          .catch(() => setWeather("denied"));
      },
      () => setWeather("denied"),
      { timeout: 8000, maximumAge: WEATHER_TTL_MS }
    );
  }

  return [weather, request];
}

/** A small always-on clock (12h by default, toggle for 24h) + opt-in,
 * click-to-fetch geolocated weather for the sidebar. */
export function ClockWeather() {
  const now = useClock();
  const [format, setFormat] = useClockFormat();
  const [weather, requestWeather] = useWeather();

  if (!now) return null;

  const period = periodOf(now.getHours());
  const greeting = GREETING[period];
  const hourNum = format === "12" ? now.getHours() % 12 || 12 : now.getHours();
  const minute = String(now.getMinutes()).padStart(2, "0");
  const second = String(now.getSeconds()).padStart(2, "0");
  const ampm = now.getHours() >= 12 ? "PM" : "AM";
  const day = now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className={`clock-weather clock-weather--${period}`}>
      <div className="clock-weather__top">
        <div className="clock-weather__greeting">
          <span aria-hidden="true">{greeting.emoji}</span> good {greeting.label}
        </div>
        <button
          className="clock-weather__format"
          type="button"
          onClick={() => setFormat(format === "12" ? "24" : "12")}
          title={`Switch to ${format === "12" ? "24-hour" : "12-hour"} time`}
        >
          {format}h
        </button>
      </div>
      <div className="clock-weather__time">
        {hourNum}
        <span className="clock-weather__colon">:</span>
        {minute}
        <span className="clock-weather__colon clock-weather__colon--sec">:</span>
        <span className="clock-weather__seconds">{second}</span>
        {format === "12" && <span className="clock-weather__ampm">{ampm}</span>}
      </div>

      <div className="clock-weather__meta">
        <span className="clock-weather__day">{day}</span>
        {typeof weather === "object" && (
          <>
            <span className="clock-weather__dot" aria-hidden="true">
              •
            </span>
            <span className="clock-weather__weather" title={weather.label}>
              <span aria-hidden="true">{weather.icon}</span> {weather.temp}°C
            </span>
          </>
        )}
      </div>
      {typeof weather !== "object" && (
        <button
          className="clock-weather__weather-cta"
          type="button"
          onClick={requestWeather}
          disabled={weather === "loading"}
        >
          {weather === "loading" ? "finding you…" : weather === "denied" ? "↻ retry weather" : "📍 add weather"}
        </button>
      )}
    </div>
  );
}
