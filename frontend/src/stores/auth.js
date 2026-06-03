import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/api'

const SESSION_DURATION_MS = 60 * 60 * 1000 // 1 hour

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('etnair_user') || 'null'))
  const token = ref(localStorage.getItem('etnair_token') || null)
  const loading = ref(false)
  const error = ref(null)

  // Check expiry on store init — if expired, clear right away
  const storedExpiry = parseInt(localStorage.getItem('etnair_token_expiry') || '0', 10)
  if (token.value && storedExpiry && Date.now() > storedExpiry) {
    user.value = null
    token.value = null
    localStorage.removeItem('etnair_user')
    localStorage.removeItem('etnair_token')
    localStorage.removeItem('etnair_token_expiry')
  }

  const isLoggedIn = computed(() => !!token.value)
  const isOwner = computed(() => user.value?.role === 'owner' || user.value?.role === 'admin')

  let expiryTimer = null

  function _scheduleExpiry() {
    clearTimeout(expiryTimer)
    const expiry = parseInt(localStorage.getItem('etnair_token_expiry') || '0', 10)
    const ms = expiry - Date.now()
    if (ms <= 0) { logout(); return }
    expiryTimer = setTimeout(logout, ms)
  }

  function _persist(u, t) {
    user.value = u
    token.value = t
    const expiry = Date.now() + SESSION_DURATION_MS
    localStorage.setItem('etnair_user', JSON.stringify(u))
    localStorage.setItem('etnair_token', t)
    localStorage.setItem('etnair_token_expiry', String(expiry))
    _scheduleExpiry()
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
    localStorage.removeItem('etnair_token_expiry')
    clearTimeout(expiryTimer)
  }

  // If a valid session is loaded from storage, schedule the auto-logout
  if (token.value) _scheduleExpiry()

  return { user, token, loading, error, isLoggedIn, isOwner, login, register, logout }
})
