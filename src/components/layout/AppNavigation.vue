<script setup>
import UnitToggler from '../weather/UnitToggler.vue'
</script>

<template>
  <header class="app-nav">
    <RouterLink class="brand" to="/"><span aria-hidden="true">◉</span> Weather Atelier</RouterLink>
    <nav aria-label="주요 메뉴">
      <RouterLink to="/">날씨</RouterLink><RouterLink to="/favorites">즐겨찾기</RouterLink><RouterLink to="/about">소개</RouterLink>
    </nav>
    <UnitToggler />
  </header>
</template>

<style scoped>
.app-nav { position: sticky; top: 0; z-index: 20; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 24px; padding: 15px max(24px, calc((100vw - 1120px) / 2)); background: rgba(245,248,252,.92); border-bottom: 1px solid #dce5ef; backdrop-filter: blur(14px); }
.brand { color: #17324d; font-weight: 850; text-decoration: none; }.brand span { color: #3d8dc5; }
nav { display: flex; gap: 8px; } nav a { padding: 8px 12px; color: #63758a; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 999px; } nav a.router-link-exact-active { color: #17689d; background: #e4f2fb; }
:deep(.unit-toggle) { justify-self: end; }
@media(max-width:700px){.app-nav{grid-template-columns:1fr auto;gap:10px;padding:12px 16px}.brand{font-size:14px}nav{grid-column:1/-1;grid-row:2;justify-content:center}:deep(.unit-toggle){grid-column:2;grid-row:1}}
</style>
