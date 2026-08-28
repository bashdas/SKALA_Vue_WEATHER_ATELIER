<script setup>
import { computed, ref, watch, watchEffect } from 'vue'
import BaseDashboardCard from './BaseDashboardCard.vue'
import DashboardHeader from './DashboardHeader.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'

const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, feelsLike: 30, status: '맑음', icon: '☀️', humidity: 58, rain: 10, wind: 2.1 },
  { id: 'city_02', name: '수원', temp: 24, feelsLike: 25, status: '비', icon: '🌧️', humidity: 82, rain: 80, wind: 3.4 },
  { id: 'city_03', name: '부산', temp: 26, feelsLike: 28, status: '구름', icon: '⛅', humidity: 70, rain: 30, wind: 4.2 },
  { id: 'city_04', name: '제주', temp: 23, feelsLike: 22, status: '바람', icon: '🌬️', humidity: 76, rain: 20, wind: 7.6 },
  { id: 'city_05', name: '대구', temp: 31, feelsLike: 34, status: '쾌청', icon: '🌤️', humidity: 49, rain: 0, wind: 1.8 },
])
const searchQuery = ref('')
const selectedCityInfo = ref(null)
const favoriteCityId = ref(null)

const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return weatherList.value
  return weatherList.value.filter((weather) => weather.name.toLowerCase().includes(query))
})
const favoriteCity = computed(() =>
  weatherList.value.find((weather) => weather.id === favoriteCityId.value) ?? null,
)
const statusMessage = computed(() =>
  selectedCityInfo.value
    ? `${selectedCityInfo.value.name}의 현재 날씨는 ${selectedCityInfo.value.status}입니다.`
    : '날씨 카드를 선택하면 상태를 확인할 수 있습니다.',
)

watch(selectedCityInfo, (newCity, oldCity) => {
  console.log(`[상태바 변경] ${oldCity?.name ?? '선택 없음'} → ${newCity?.name ?? '선택 없음'}: ${statusMessage.value}`)
})
watchEffect(() => console.log(`[검색어 변경] ${searchQuery.value || '검색어 없음'}`))
watch(favoriteCityId, () => console.log(`[즐겨찾기 변경] ${favoriteCity.value?.name ?? '즐겨찾기 없음'}`))

const updateSearchQuery = (query) => { searchQuery.value = query }
const searchCity = (query) => { searchQuery.value = query }
const selectCity = (weather) => { selectedCityInfo.value = weather }
const toggleFavorite = (cityId) => {
  favoriteCityId.value = favoriteCityId.value === cityId ? null : cityId
}
const showDetail = (weather) => {
  window.alert(`${weather.name}의 현재 날씨는 [${weather.status}] 상태입니다.`)
}
</script>

<template>
  <main class="weather-page">
    <section class="weather-dashboard">
      <DashboardHeader :status-message="statusMessage" :favorite-city="favoriteCity" />
      <BaseDashboardCard>
        <SearchBar
          :model-value="searchQuery"
          @update:model-value="updateSearchQuery"
          @search="searchCity"
        />
      </BaseDashboardCard>

      <div class="weather-section-heading">
        <h2>지역별 날씨 현황</h2>
        <p>카드를 클릭하거나 검색해보세요.</p>
      </div>

      <section v-if="filteredWeatherList.length" class="weather-grid" aria-label="지역별 날씨 카드">
        <BaseDashboardCard
          v-for="weather in filteredWeatherList"
          :key="weather.id"
          as="div"
          variant="weather"
          :selected="selectedCityInfo?.id === weather.id"
        >
          <WeatherCard
            :city="weather"
            :is-favorite="favoriteCityId === weather.id"
            :selected="selectedCityInfo?.id === weather.id"
            @select-card="selectCity"
            @click-detail="showDetail"
            @toggle-favorite="toggleFavorite"
          />
        </BaseDashboardCard>
      </section>
      <p v-else class="empty-message" role="status">
        “{{ searchQuery.trim() }}” 검색 결과와 일치하는 도시가 없습니다.
      </p>
    </section>
  </main>
</template>

<style scoped>
.weather-page { min-height: 100vh; padding: 56px 24px 72px; }
.weather-dashboard { width: min(1040px, 100%); margin: 0 auto; }
.weather-section-heading { margin: 28px 4px 15px; }
.weather-section-heading h2 { margin: 0; color: #1d2c43; font-size: 22px; letter-spacing: -0.5px; }
.weather-section-heading p { margin: 6px 0 0; color: #7c899a; font-size: 14px; }
.weather-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.empty-message {
  padding: 42px 24px;
  margin: 0;
  color: #718096;
  text-align: center;
  background: #fff;
  border: 1px dashed #cbd5e1;
  border-radius: 16px;
}
@media (max-width: 780px) {
  .weather-page { padding: 40px 18px; }
  .weather-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 520px) { .weather-grid { grid-template-columns: 1fr; } }
</style>
