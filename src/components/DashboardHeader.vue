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
      <p class="eyebrow">KOREA WEATHER DESK</p>
      <h1>오늘의 하늘을<br><em>한눈에.</em></h1>
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
.eyebrow { margin:0 0 10px; color:#4285b5; font-size:11px; font-weight:850; letter-spacing:2px; }
h1 { margin: 0; color: #17243a; font-family: Georgia,serif; font-size: 52px; line-height:.98; letter-spacing: -2.5px; } h1 em{color:#2c7bb2;font-weight:500}
.status-message,
.favorite-message { margin: 8px 0 0; color: #65748a; font-size: 14px; }
.favorite-message { color: #9a681d; font-weight: 700; }
.data-badge{display:inline-flex;align-items:center;gap:7px;margin:14px 0 0;padding:6px 10px;color:#65748a;font-size:11px;background:#fff;border:1px solid #dae4ed;border-radius:99px}.data-badge span{width:7px;height:7px;background:#e49b4c;border-radius:50%}.data-badge span.live{background:#3caf75;box-shadow:0 0 0 3px #dff5e9}
@media (max-width: 520px) { h1 { font-size: 31px; } }
</style>
