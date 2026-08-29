<script setup>
defineProps({
  as: { type: String, default: 'section' },
  variant: {
    type: String,
    default: 'panel',
    validator: (value) => ['panel', 'weather'].includes(value),
  },
  selected: { type: Boolean, default: false },
})
</script>

<template>
  <component
    :is="as"
    class="dashboard-card"
    :class="[`dashboard-card--${variant}`, { 'dashboard-card--selected': selected }]"
  >
    <slot />
  </component>
</template>

<style scoped>
.dashboard-card {
  background: #fff;
  border: 1px solid #cdd6de;
  border-radius: 16px;
  box-shadow: none;
}

.dashboard-card--panel { padding: 22px 24px; }

.dashboard-card--weather {
  min-width: 0;
  min-height: 320px;
  background: transparent;
  border-color: transparent;
  perspective: 1000px;
  transition: transform 0.25s ease;
}

.dashboard-card--weather:hover,
.dashboard-card--weather:focus-within { transform: translateY(-7px); }

.dashboard-card--weather.dashboard-card--selected {
  border-color: #5e8acc;
  box-shadow: 0 0 0 3px #c8deff;
}
</style>
