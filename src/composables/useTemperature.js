import { computed, unref } from 'vue'
import { storeToRefs } from 'pinia'
import { useConfigStore } from '../stores/configStore'

export function useTemperature(celsius) {
  const store = useConfigStore()
  const { unit, unitSymbol } = storeToRefs(store)
  const displayTemp = computed(() => unit.value === 'fahrenheit' ? Math.round((Number(unref(celsius)) * 9) / 5 + 32) : Math.round(Number(unref(celsius))))
  return { displayTemp, unitSymbol }
}
