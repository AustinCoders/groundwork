export const runtime = "nodejs";

const WEATHER_CODES: Record<number, { label: string; icon: string }> = {
  0: { label: "Clear sky", icon: "☀️" },
  1: { label: "Mostly clear", icon: "🌤️" },
  2: { label: "Partly cloudy", icon: "⛅" },
  3: { label: "Overcast", icon: "☁️" },
  45: { label: "Fog", icon: "🌫️" },
  48: { label: "Fog", icon: "🌫️" },
  51: { label: "Light drizzle", icon: "🌦️" },
  53: { label: "Drizzle", icon: "🌦️" },
  55: { label: "Heavy drizzle", icon: "🌧️" },
  56: { label: "Freezing drizzle", icon: "🌧️" },
  57: { label: "Freezing drizzle", icon: "🌧️" },
  61: { label: "Light rain", icon: "🌧️" },
  63: { label: "Rain", icon: "🌧️" },
  65: { label: "Heavy rain", icon: "🌧️" },
  66: { label: "Freezing rain", icon: "🌨️" },
  67: { label: "Freezing rain", icon: "🌨️" },
  71: { label: "Light snow", icon: "🌨️" },
  73: { label: "Snow", icon: "❄️" },
  75: { label: "Heavy snow", icon: "❄️" },
  77: { label: "Snow grains", icon: "❄️" },
  80: { label: "Light showers", icon: "🌦️" },
  81: { label: "Showers", icon: "🌧️" },
  82: { label: "Heavy showers", icon: "⛈️" },
  85: { label: "Snow showers", icon: "🌨️" },
  86: { label: "Snow showers", icon: "🌨️" },
  95: { label: "Thunderstorm", icon: "⛈️" },
  96: { label: "Thunderstorm + hail", icon: "⛈️" },
  99: { label: "Thunderstorm + hail", icon: "⛈️" },
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));

  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return Response.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  const gridLat = lat.toFixed(1);
  const gridLon = lon.toFixed(1);

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${gridLat}&longitude=${gridLon}&current=temperature_2m,weather_code&timezone=auto`;
    const res = await fetch(url, { next: { revalidate: 600 } });
    if (!res.ok) throw new Error(`Open-Meteo responded ${res.status}`);
    const data = await res.json();

    const code = data?.current?.weather_code;
    const temp = data?.current?.temperature_2m;
    if (typeof temp !== "number") throw new Error("Missing temperature in response");

    const weather = WEATHER_CODES[code] || { label: "—", icon: "🌡️" };
    return Response.json(
      { temp: Math.round(temp), label: weather.label, icon: weather.icon },
      { headers: { "Cache-Control": "public, max-age=600" } }
    );
  } catch {
    return Response.json({ error: "Weather lookup failed" }, { status: 502 });
  }
}
