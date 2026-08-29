<script setup>
defineProps({
  statusMessage: { type: String, required: true },
  favoriteCity: { type: Object, default: null },
  live: { type: Boolean, default: false },
})
</script>

<template>
  <header class="dashboard-header">
    <div>
      <p class="eyebrow">WEATHER ATELIER</p>
      <h1>지역별<br><em>날씨 현황</em></h1>
      <p class="status-message" aria-live="polite">{{ statusMessage }}</p>
      <p v-if="favoriteCity" class="favorite-message">
        ⭐ 즐겨찾기: {{ favoriteCity.name }} ({{ favoriteCity.temp }}°C)
      </p>
      <p class="data-badge"><span :class="{ live }"></span>{{ live ? 'OpenWeatherMap 실시간 데이터' : 'Mock 데이터 모드' }}</p>
    </div>
  </header>
</template>

<style scoped>
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
  margin-bottom: 28px;
}
.eyebrow { margin:0 0 10px; color:var(--primary-700); font-size:11px; font-weight:700; letter-spacing:1.4px; }
h1 { margin: 0; color: var(--primary-900); font-size:46px; font-weight:700; line-height:1.16; letter-spacing:-1.8px; } h1 em{color:var(--primary-700);font-style:normal;font-weight:700}
.status-message,
.favorite-message { margin: 8px 0 0; color: #3b5780; font-size: 14px; }
.favorite-message { color: var(--primary-700); font-weight: 700; }
.data-badge{display:inline-flex;align-items:center;gap:7px;margin:14px 0 0;padding:6px 10px;color:#3b5780;font-size:11px;background:#fff;border:1px solid var(--grey-200);border-radius:8px}.data-badge span{width:7px;height:7px;background:var(--primary-500);border-radius:50%}.data-badge span.live{background:var(--primary-700);box-shadow:0 0 0 3px var(--primary-100)}
@media (max-width: 520px) { h1 { font-size: 31px; } }
</style>
