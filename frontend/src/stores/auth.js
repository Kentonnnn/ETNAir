import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('etnair_user') || 'null'))
  const token = ref(localStorage.getItem('etnair_token') || null)
  const loading = ref(false)
  const error = ref(null)

  const isLoggedIn = computed(() => !!token.value)
  const isOwner = computed(() => user.value?.role === 'owner' || user.value?.role === 'admin')

  function _persist(u, t) {
    user.value = u
    token.value = t
    localStorage.setItem('etnair_user', JSON.stringify(u))
    localStorage.setItem('etnair_token', t)
  }

  async function login(email, password) {
    loading.value = true; error.value = null
    try {
      const { data } = await authService.login(email, password)
      _persist(data.user, data.token)
      return true
    } catch (e) {
      error.value = e.response?.data?.error || 'Erreur de connexion'
      return false
    } finally { loading.value = false }
  }

  async function register(payload) {
    loading.value = true; error.value = null
    try {
      const { data } = await authService.register(payload)
      _persist(data.user, data.token)
      return true
    } catch (e) {
      error.value = e.response?.data?.error || "Erreur lors de l'inscription"
      return false
    } finally { loading.value = false }
  }

  function logout() {
    user.value = null; token.value = null
    localStorage.removeItem('etnair_token')
    localStorage.removeItem('etnair_user')
  }

  return { user, token, loading, error, isLoggedIn, isOwner, login, register, logout }
})