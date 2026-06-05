export async function getOpenMeteoRainfall(lat: number, lng: number): Promise<number> {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lng}` +
      `&hourly=precipitation&forecast_days=1&timezone=auto`;

    const res = await fetch(url);
    if (!res.ok) return 0;

    const json = (await res.json()) as { hourly?: { precipitation?: number[] } };
    const hourly = json.hourly?.precipitation ?? [];
    const hourIndex = Math.min(new Date().getHours(), hourly.length - 1);
    return typeof hourly[hourIndex] === 'number' ? (hourly[hourIndex] as number) : 0;
  } catch {
    // fail open — don't penalize reporters when weather API is down
    return 0;
  }
}
