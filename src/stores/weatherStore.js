import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { fallbackCities } from '../data/cities'
import { mapCurrentWeather, mapForecast } from '../mappers/weatherMapper'
import { searchCities } from '../services/geocodingApi'
import { hasWeatherApiKey, getCurrentWeather, getForecast } from '../services/openWeatherApi'
import { readableApiError } from '../services/http'

export const useWeatherStore = defineStore('weather', () => {
  const weatherList = ref(fallbackCities.map((city) => ({ ...city })))
  const selectedCityId = ref(null)
  const favoriteCityIds = ref(JSON.parse(localStorage.getItem('weather-favorites') || '[]'))
  const recentCityIds = ref(JSON.parse(localStorage.getItem('weather-recents') || '[]'))
  const loading = ref(false)
  const searching = ref(false)
  const error = ref('')
  const usingLiveData = ref(false)

  const selectedCity = computed(() => weatherList.value.find((city) => city.id === selectedCityId.value) ?? null)
  const favoriteCities = computed(() => favoriteCityIds.value.map((id) => weatherList.value.find((city) => city.id === id)).filter(Boolean))

  async function loadCurrentWeather() {
    if (!hasWeatherApiKey) { error.value = 'API 키가 없어 Mock 데이터를 표시합니다.'; return }
    loading.value = true; error.value = ''
    try {
      const settled = await Promise.allSettled(weatherList.value.map((city) => getCurrentWeather(city)))
      const live = settled.map((result, index) => result.status === 'fulfilled' ? mapCurrentWeather(result.value, weatherList.value[index]) : weatherList.value[index])
      if (!settled.some((result) => result.status === 'fulfilled')) throw settled[0]?.reason
      weatherList.value = live
      usingLiveData.value = true
      if (settled.some((result) => result.status === 'rejected')) error.value = '일부 도시는 Mock 데이터로 표시합니다.'
    } catch (requestError) {
      error.value = `${readableApiError(requestError)} Mock 데이터를 표시합니다.`
      usingLiveData.value = false
    } finally { loading.value = false }
  }

  async function findRemoteCity(query) {
    searching.value = true; error.value = ''
    try {
      const [result] = await searchCities(query)
      if (!result) { error.value = '외부 도시 검색 결과가 없습니다.'; return null }
      const base = { id: `geo-${result.id}`, name: result.name, country: result.country_code || '', lat: result.latitude, lon: result.longitude }
      let city = { ...base, temp: 20, feelsLike: 20, status: '날씨 연결 대기', icon: '01d', humidity: 0, rain: 0, wind: 0 }
      if (hasWeatherApiKey) {
        try { city = mapCurrentWeather(await getCurrentWeather(base), base) }
        catch (weatherError) { error.value = `${readableApiError(weatherError)} 도시 위치만 추가했습니다.` }
      }
      const index = weatherList.value.findIndex((item) => item.id === city.id)
      if (index < 0) weatherList.value.push(city); else weatherList.value[index] = city
      selectCity(city.id)
      return city
    } catch (requestError) { error.value = readableApiError(requestError); return null }
    finally { searching.value = false }
  }

  async function loadForecast(city) {
    if (!hasWeatherApiKey) return []
    return mapForecast(await getForecast(city))
  }

  function selectCity(id) {
    selectedCityId.value = id
    recentCityIds.value = [id, ...recentCityIds.value.filter((item) => item !== id)].slice(0, 5)
  }
  function toggleFavorite(id) {
    favoriteCityIds.value = favoriteCityIds.value.includes(id) ? favoriteCityIds.value.filter((item) => item !== id) : [...favoriteCityIds.value, id]
  }
  const isFavorite = (id) => favoriteCityIds.value.includes(id)
  const getCity = (id) => weatherList.value.find((city) => city.id === id)

  watch(favoriteCityIds, (value) => localStorage.setItem('weather-favorites', JSON.stringify(value)), { deep: true })
  watch(recentCityIds, (value) => localStorage.setItem('weather-recents', JSON.stringify(value)), { deep: true })
  return { weatherList, selectedCityId, selectedCity, favoriteCityIds, favoriteCities, recentCityIds, loading, searching, error, usingLiveData, loadCurrentWeather, findRemoteCity, loadForecast, selectCity, toggleFavorite, isFavorite, getCity }
})
