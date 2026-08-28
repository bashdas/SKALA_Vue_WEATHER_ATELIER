<script setup>
import Button from 'primevue/button'
import { storeToRefs } from 'pinia'
import { useConfigStore } from '../../stores/configStore'
const store = useConfigStore()
const { unit } = storeToRefs(store)
</script>
<template><Button class="unit-toggle" size="small" severity="secondary" outlined :label="unit === 'celsius' ? '℃ 섭씨' : '℉ 화씨'" icon="pi pi-sync" aria-label="온도 단위 전환" @click="store.toggleUnit" /></template>
