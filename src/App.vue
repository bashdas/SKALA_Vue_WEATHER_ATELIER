<script setup>
import Toast from 'primevue/toast'
import AppNavigation from './components/layout/AppNavigation.vue'
</script>

<template>
  <div class="app-shell">
    <AppNavigation />
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in"><component :is="Component" /></Transition>
    </RouterView>
    <Toast position="bottom-right" />
  </div>
</template>
