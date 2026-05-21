<template>
  <div class="search-bar">
    <div class="search-field">
      <span class="search-icon">📍</span>
      <input v-model="form.city" class="search-input" placeholder="Ville (Paris, Lyon...)" @keyup.enter="handleSearch()" />
    </div>
    <div class="search-divider"></div>
    <div class="search-field">
      <span class="search-icon">💶</span>
      <input v-model.number="form.maxPrice" type="number" min="0" class="search-input" placeholder="Prix max / nuit" @keyup.enter="handleSearch()" />
    </div>
    <button class="search-btn" @click="handleSearch()">
      <span>Rechercher</span> 🔍
    </button>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
const emit = defineEmits(['search'])
const form = reactive({ city: '', maxPrice: null })

watch(() => form.maxPrice, (value) => {
  if (value !== null && value < 0) {
    form.maxPrice = 0
  }
})

function handleSearch() {
  if (form.maxPrice !== null && form.maxPrice < 0) form.maxPrice = 0
  emit('search', form)
}
</script>

<style scoped>
.search-bar { display: flex; align-items: center; background: var(--white); border-radius: 60px; padding: 8px 8px 8px 24px; box-shadow: var(--shadow-lg); gap: 0; max-width: 640px; width: 100%; }
.search-field { display: flex; align-items: center; gap: 8px; flex: 1; }
.search-icon { font-size: 1rem; flex-shrink: 0; }
.search-input { border: none; outline: none; font-family: var(--font); font-size: .95rem; color: var(--text); width: 100%; background: transparent; }
.search-input::placeholder { color: var(--text-muted); }
.search-divider { width: 1px; height: 28px; background: var(--border); margin: 0 12px; flex-shrink: 0; }
.search-btn { display: flex; align-items: center; gap: 6px; background: var(--primary); color: #fff; border: none; padding: 14px 24px; border-radius: 50px; font-family: var(--font); font-size: .95rem; font-weight: 600; cursor: pointer; transition: all var(--transition); white-space: nowrap; flex-shrink: 0; }
.search-btn:hover { background: var(--primary-dark); transform: scale(1.02); }
@media (max-width: 600px) { .search-bar { flex-direction: column; border-radius: var(--radius); padding: 16px; gap: 12px; } .search-divider { display: none; } .search-btn { width: 100%; justify-content: center; } }
</style>