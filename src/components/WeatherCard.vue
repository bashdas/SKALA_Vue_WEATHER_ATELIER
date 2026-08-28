<script setup>
import { computed } from 'vue'
import Button from 'primevue/button'
import { weatherEmoji } from '../data/cities'
import { useTemperature } from '../composables/useTemperature'

const props = defineProps({ city: { type: Object, required: true }, isFavorite: { type: Boolean, default: false }, selected: { type: Boolean, default: false } })
const emit = defineEmits(['select-card', 'click-detail', 'toggle-favorite', 'open-context-menu'])
const celsius = computed(() => props.city.temp)
const { displayTemp, unitSymbol } = useTemperature(celsius)

function openKeyboardMenu(event) {
  if (!(event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10'))) return
  event.preventDefault()
  const rect = event.currentTarget.getBoundingClientRect()
  const pointerEvent = new MouseEvent('contextmenu', { bubbles: true, clientX: rect.left + 24, clientY: rect.top + 24 })
  emit('open-context-menu', pointerEvent, props.city)
}
</script>

<template>
  <article class="weather-card" :class="{ selected }" tabindex="0"
    :aria-label="`${city.name}, ${displayTemp}${unitSymbol}, ${city.status}${selected ? ', 선택됨' : ''}`"
    @click="emit('select-card', city)" @keydown.enter="emit('select-card', city)" @keydown.space.prevent="emit('select-card', city)"
    @keydown="openKeyboardMenu" @contextmenu.prevent="emit('open-context-menu', $event, city)">
    <div class="card-top"><div><p class="city-name">{{ city.name }}</p><p class="weather-status">{{ city.status }}</p></div><span class="weather-icon" aria-hidden="true">{{ weatherEmoji(city.icon) }}</span></div>
    <p class="temperature">{{ displayTemp }}<span>{{ unitSymbol }}</span></p>
    <div v-if="city.temp >= 25" class="temperature-label hot">🔥 더움 (25도 이상)</div>
    <div v-else class="temperature-label cool">❄️ 선선함 (25도 미만)</div>
    <dl class="mini-details"><div><dt>습도</dt><dd>{{ city.humidity }}%</dd></div><div><dt>바람</dt><dd>{{ city.wind }}m/s</dd></div><div><dt>강수</dt><dd>{{ city.rain }}%</dd></div></dl>
    <div class="card-actions">
      <Button size="small" text :icon="isFavorite ? 'pi pi-star-fill' : 'pi pi-star'" :label="isFavorite ? '즐겨찾기 해제' : '즐겨찾기'" @click.stop="emit('toggle-favorite', city.id)" />
      <Button size="small" label="상세보기" icon="pi pi-arrow-right" icon-pos="right" @click.stop="emit('click-detail', city)" />
      <Button class="more-button" size="small" text icon="pi pi-ellipsis-v" aria-label="빠른 작업 메뉴" @click.stop="emit('open-context-menu', $event, city)" />
    </div>
  </article>
</template>

<style scoped>
.weather-card{height:100%;min-height:330px;padding:23px;color:#22334a;background:#fff;border:1px solid #dfe7ef;border-radius:18px;box-shadow:0 7px 24px rgba(28,58,86,.06);outline:none;transition:.22s ease}.weather-card:hover,.weather-card:focus-visible{transform:translateY(-4px);border-color:#6ea6cd;box-shadow:0 16px 34px rgba(28,58,86,.13)}.weather-card:focus-visible{box-shadow:0 0 0 4px #c9e8fb,0 16px 34px rgba(28,58,86,.13)}.weather-card.selected{border-color:#287bb4;background:linear-gradient(160deg,#fff,#f2f9fd)}
.card-top{display:flex;justify-content:space-between}.city-name{margin:0;font-family:Georgia,serif;font-size:24px;font-weight:750}.weather-status{margin:5px 0 0;color:#7b8998;font-size:13px}.weather-icon{font-size:40px}.temperature{margin:21px 0 11px;font-size:47px;font-weight:800;letter-spacing:-2px}.temperature span{margin-left:3px;color:#728196;font-size:17px;font-weight:600}.temperature-label{display:inline-block;padding:6px 9px;font-size:12px;font-weight:750;border-radius:6px}.hot{color:#b64e37;background:#ffede7}.cool{color:#276d9e;background:#e7f3fb}
.mini-details{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:20px 0 16px;padding-top:16px;border-top:1px solid #edf1f5}.mini-details div{padding:7px;background:#f7f9fb;border-radius:7px}.mini-details dt{color:#8995a4;font-size:10px}.mini-details dd{margin:3px 0 0;font-size:13px;font-weight:750}.card-actions{display:flex;align-items:center;gap:3px}.card-actions :deep(.p-button){font-size:11px}.more-button{margin-left:auto}@media(min-width:700px){.more-button{display:none}}
</style>
