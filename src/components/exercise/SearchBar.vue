<script setup>
import { ref } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
defineProps({ modelValue: { type: String, required: true }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['update:modelValue', 'update-query', 'search'])
const inputRef = ref(null)
const update = (value) => { emit('update:modelValue', value); emit('update-query', value) }
defineExpose({ focus: () => inputRef.value?.$el?.focus() })
</script>

<template>
  <form class="search-bar" role="search" @submit.prevent="emit('search', modelValue)">
    <label for="city-search">도시 이름 검색</label>
    <div class="search-input-wrap">
      <i class="pi pi-search" aria-hidden="true"></i>
      <InputText ref="inputRef"
        id="city-search"
        :value="modelValue"
        type="text"
        placeholder="예: 서울, 부산, 제주"
        @input="update($event.target.value)"
      />
      <Button type="submit" label="도시 찾기" size="small" :loading="loading" />
    </div>
    <p>입력한 도시명: <strong>{{ modelValue || '아직 입력하지 않았습니다.' }}</strong></p>
  </form>
</template>

<style scoped>
.search-bar label {
  display: block;
  margin-bottom: 9px;
  color: #3b5780;
  font-size: 15px;
  font-weight: 700;
}

.search-input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  background: #e6eaed;
  border: 1px solid #cdd6de;
  border-radius: 10px;
}

.search-input-wrap:focus-within {
  background: #fff;
  border-color: #5e8acc;
  box-shadow: 0 0 0 3px #c8deff;
}

.search-input-wrap span { font-size: 17px; }
.search-input-wrap input {
  width: 100%;
  padding: 12px 0;
  color: #3b5780;
  background: transparent;
  border: 0;
  outline: 0;
}
.search-input-wrap :deep(.p-button) { flex: 0 0 auto; }
.search-input-wrap input::placeholder { color: #5e8acc; }
.search-bar p { margin: 11px 2px 0; color: #3b5780; font-size: 14px; }
.search-bar strong { color: #5e8acc; }
</style>
