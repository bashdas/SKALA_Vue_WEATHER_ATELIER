import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', () => {
  const unit = ref(localStorage.getItem('weather-unit') || 'celsius')
  const unitSymbol = computed(() => unit.value === 'fahrenheit' ? '℉' : '℃')
  const toggleUnit = () => { unit.value = unit.value === 'celsius' ? 'fahrenheit' : 'celsius' }
  const setUnit = (value) => { if (['celsius', 'fahrenheit'].includes(value)) unit.value = value }
  watch(unit, (value) => localStorage.setItem('weather-unit', value))
  return { unit, unitSymbol, toggleUnit, setUnit }
})
