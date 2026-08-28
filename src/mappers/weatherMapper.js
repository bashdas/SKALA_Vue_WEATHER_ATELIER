export function mapCurrentWeather(source, base = {}) {
  return {
    ...base,
    id: base.id || `owm-${source.id}`,
    name: base.name || source.name,
    country: source.sys?.country || base.country || '',
    lat: source.coord.lat, lon: source.coord.lon,
    temp: Math.round(source.main.temp), feelsLike: Math.round(source.main.feels_like),
    status: source.weather[0]?.description || '정보 없음', icon: source.weather[0]?.icon || '01d',
    humidity: source.main.humidity,
    rain: Math.round(source.pop ? source.pop * 100 : (source.rain?.['1h'] ? 100 : 0)),
    wind: source.wind.speed,
  }
}

export function mapForecast(data) {
  const byDay = new Map()
  for (const item of data.list ?? []) {
    const date = item.dt_txt.slice(0, 10)
    const hour = Number(item.dt_txt.slice(11, 13))
    const previous = byDay.get(date)
    if (!previous || Math.abs(hour - 12) < Math.abs(previous.hour - 12)) {
      byDay.set(date, { id: item.dt, date, hour, temp: Math.round(item.main.temp), min: Math.round(item.main.temp_min), max: Math.round(item.main.temp_max), status: item.weather[0]?.description || '', icon: item.weather[0]?.icon || '01d', rain: Math.round((item.pop ?? 0) * 100) })
    }
  }
  return [...byDay.values()].slice(0, 5)
}
