import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

// Reactive cache so all components re-render when the pic changes
const cache = ref({})

function key(userId) {
  return `etnair_profile_pic_${userId}`
}

function loadFromStorage(userId) {
  if (!userId) return null
  if (cache.value[userId] !== undefined) return cache.value[userId]
  const v = localStorage.getItem(key(userId)) || null
  cache.value[userId] = v
  return v
}

export function useProfilePic(userId) {
  const auth = useAuthStore()
  const id = computed(() => userId ?? auth.user?.id)
  const pic = computed(() => loadFromStorage(id.value))

  function setPic(dataUrl) {
    if (!id.value) return
    localStorage.setItem(key(id.value), dataUrl)
    cache.value = { ...cache.value, [id.value]: dataUrl }
  }

  function removePic() {
    if (!id.value) return
    localStorage.removeItem(key(id.value))
    cache.value = { ...cache.value, [id.value]: null }
  }

  return { pic, setPic, removePic }
}

// Read-only access for components rendering other users' avatars
export function getProfilePic(userId) {
  return loadFromStorage(userId)
}
