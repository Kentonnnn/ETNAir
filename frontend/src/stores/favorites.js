import { defineStore } from 'pinia'
import { ref } from 'vue'
import { favoriteService } from '@/services/api'
import { useAuthStore } from './auth'

export const useFavoritesStore = defineStore('favorites', () => {
  const ids = ref(new Set())
  const loaded = ref(false)

  async function load() {
    const auth = useAuthStore()
    if (!auth.isLoggedIn) return
    try {
      const { data } = await favoriteService.getIds()
      ids.value = new Set(data.favoriteIds)
      loaded.value = true
    } catch {}
  }

  function isFav(listingId) {
    return ids.value.has(listingId)
  }

  async function toggle(listingId) {
    if (ids.value.has(listingId)) {
      await favoriteService.remove(listingId)
      ids.value.delete(listingId)
    } else {
      await favoriteService.add(listingId)
      ids.value.add(listingId)
    }
  }

  function reset() {
    ids.value = new Set()
    loaded.value = false
  }

  return { ids, loaded, load, isFav, toggle, reset }
})
