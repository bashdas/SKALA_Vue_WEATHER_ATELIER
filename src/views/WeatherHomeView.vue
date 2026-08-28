<script setup>
import { computed, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'
import ContextMenu from 'primevue/contextmenu'
import Message from 'primevue/message'
import Skeleton from 'primevue/skeleton'
import BaseDashboardCard from '../components/BaseDashboardCard.vue'
import DashboardHeader from '../components/DashboardHeader.vue'
import SearchBar from '../components/SearchBar.vue'
import WeatherCard from '../components/WeatherCard.vue'
import { useConfigStore } from '../stores/configStore'
import { useWeatherStore } from '../stores/weatherStore'

const router = useRouter(); const toast = useToast(); const store = useWeatherStore(); const configStore = useConfigStore()
const { weatherList, selectedCity, selectedCityId, loading, searching, error, usingLiveData } = storeToRefs(store)
const searchQuery = ref(''); const searchRef = ref(null); const menuRef = ref(null); const menuCity = ref(null)
const filteredWeatherList = computed(() => { const query = searchQuery.value.trim().toLowerCase(); return query ? weatherList.value.filter((city) => city.name.toLowerCase().includes(query)) : weatherList.value })
const favoriteCity = computed(() => selectedCity.value && store.isFavorite(selectedCity.value.id) ? selectedCity.value : null)
const statusMessage = computed(() => selectedCity.value ? `${selectedCity.value.name}이(가) 선택되었습니다.` : '카드를 선택하거나 도시를 검색해보세요.')
const menuItems = computed(() => menuCity.value ? [
  { label: '상세 날씨', icon: 'pi pi-arrow-right', command: () => showDetail(menuCity.value) },
  { label: store.isFavorite(menuCity.value.id) ? '즐겨찾기 해제' : '즐겨찾기 추가', icon: 'pi pi-star', command: () => toggleFavorite(menuCity.value.id) },
  { separator: true }, { label: '온도 단위 전환', icon: 'pi pi-sync', command: configStore.toggleUnit },
] : [])

function selectCity(city) { store.selectCity(city.id) }
function showDetail(city) { store.selectCity(city.id); router.push({ name: 'weather-detail', params: { cityId: city.id } }) }
function toggleFavorite(id) { store.toggleFavorite(id); toast.add({ severity: 'success', summary: '즐겨찾기 변경', detail: store.isFavorite(id) ? '즐겨찾기에 추가했습니다.' : '즐겨찾기에서 해제했습니다.', life: 2200 }) }
function openContextMenu(event, city) { menuCity.value = city; store.selectCity(city.id); menuRef.value?.show(event) }
async function searchCity(query) {
  const trimmed = query.trim(); if (!trimmed) return
  if (filteredWeatherList.value.length) { selectCity(filteredWeatherList.value[0]); return }
  const city = await store.findRemoteCity(trimmed)
  if (city) { searchQuery.value = city.name; toast.add({ severity: 'info', summary: '도시를 찾았습니다', detail: `${city.name}의 날씨를 추가했습니다.`, life: 2500 }) }
}
function onShortcut(event) {
  const target = event.target; const typing = ['INPUT','TEXTAREA','SELECT'].includes(target?.tagName) || target?.isContentEditable
  if (event.key === '/' && !typing) { event.preventDefault(); searchRef.value?.focus() }
  if (event.key.toLowerCase() === 'f' && !typing && selectedCityId.value) { event.preventDefault(); toggleFavorite(selectedCityId.value) }
  if (event.key === 'Escape') menuRef.value?.hide()
}
watch(selectedCity, (next, previous) => console.log(`[상태바 변경] ${previous?.name ?? '선택 없음'} → ${next?.name ?? '선택 없음'}: ${statusMessage.value}`))
watchEffect(() => console.log(`[검색어 변경] ${searchQuery.value || '검색어 없음'}`))
onMounted(() => { store.loadCurrentWeather(); window.addEventListener('keydown', onShortcut) })
onUnmounted(() => window.removeEventListener('keydown', onShortcut))
</script>

<template>
  <main class="weather-page"><section class="weather-dashboard">
    <DashboardHeader :status-message="statusMessage" :favorite-city="favoriteCity" :live="usingLiveData" />
    <BaseDashboardCard><SearchBar ref="searchRef" v-model="searchQuery" :loading="searching" @update-query="searchQuery = $event" @search="searchCity" /></BaseDashboardCard>
    <Message v-if="error" severity="warn" :closable="false">{{ error }}</Message>
    <div class="weather-section-heading"><div><p class="eyebrow">LIVE BOARD</p><h2>지역별 날씨 현황</h2></div><p><kbd>/</kbd> 검색 · <kbd>F</kbd> 즐겨찾기 · 카드 우클릭 빠른 메뉴</p></div>
    <section v-if="loading" class="weather-grid" aria-label="날씨 불러오는 중"><Skeleton v-for="index in 5" :key="index" height="330px" border-radius="18px" /></section>
    <section v-else-if="filteredWeatherList.length" class="weather-grid" aria-label="지역별 날씨 카드">
      <WeatherCard v-for="weather in filteredWeatherList" :key="weather.id" :city="weather" :is-favorite="store.isFavorite(weather.id)" :selected="selectedCityId === weather.id" @select-card="selectCity" @click-detail="showDetail" @toggle-favorite="toggleFavorite" @open-context-menu="openContextMenu" />
    </section>
    <div v-else class="empty-message" role="status"><span>⌕</span><h3>“{{ searchQuery.trim() }}”와 일치하는 기본 도시가 없습니다.</h3><p>Enter 또는 도시 찾기 버튼을 누르면 외부 도시 검색을 진행합니다.</p></div>
    <ContextMenu ref="menuRef" :model="menuItems" />
  </section></main>
</template>

<style scoped>
.weather-page{min-height:calc(100vh - 70px);padding:60px 24px 80px}.weather-dashboard{width:min(1080px,100%);margin:auto}.weather-section-heading{display:flex;align-items:end;justify-content:space-between;gap:20px;margin:38px 3px 16px}.weather-section-heading h2{margin:2px 0 0;font-family:Georgia,serif;font-size:25px}.weather-section-heading>p{margin:0;color:#7a8999;font-size:12px}.eyebrow{margin:0;color:#4285b5;font-size:10px;font-weight:850;letter-spacing:1.8px}.weather-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:17px}.empty-message{padding:52px 24px;text-align:center;background:#fff;border:1px dashed #bdcddd;border-radius:18px}.empty-message span{font-size:36px}.empty-message h3{margin:12px 0 5px}.empty-message p{margin:0;color:#7a8999}kbd{padding:2px 6px;background:#fff;border:1px solid #ccd7e0;border-bottom-width:2px;border-radius:4px}@media(max-width:800px){.weather-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:560px){.weather-page{padding:35px 16px}.weather-grid{grid-template-columns:1fr}.weather-section-heading{align-items:start;flex-direction:column}.weather-section-heading>p{line-height:1.8}}
</style>
