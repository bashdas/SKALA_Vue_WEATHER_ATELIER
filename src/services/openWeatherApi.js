import { weatherHttp } from './http'

const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY
export const hasWeatherApiKey = Boolean(apiKey)

export async function getCurrentWeather({ lat, lon }) {
  const { data } = await weatherHttp.get('/weather', { params: { lat, lon, appid: apiKey, units: 'metric', lang: 'kr' } })
  return data
}

export async function getForecast({ lat, lon }) {
  const { data } = await weatherHttp.get('/forecast', { params: { lat, lon, appid: apiKey, units: 'metric', lang: 'kr' } })
  return data
}
