import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const dark = ref(localStorage.getItem('etnair_theme') === 'dark')

  function toggle() {
    dark.value = !dark.value
  }

  watch(dark, val => {
    localStorage.setItem('etnair_theme', val ? 'dark' : 'light')
    document.documentElement.setAttribute('data-theme', val ? 'dark' : 'light')
  }, { immediate: true })

  return { dark, toggle }
})
