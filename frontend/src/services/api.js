import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

// Attach JWT on every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('etnair_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global error handler
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('etnair_token')
      localStorage.removeItem('etnair_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
}

// ── Listings / Annonces ───────────────────────
export const listingService = {
  getAll: (params = {}) => api.get('/annonces', { params }),
  getOne: (id) => api.get(`/annonces/${id}`),
  create: (data) => api.post('/annonces', data),
  update: (id, data) => api.put(`/annonces/${id}`, data),
  remove: (id) => api.delete(`/annonces/${id}`),
}

// ── Users ─────────────────────────────────────
export const userService = {
  getAll: () => api.get('/utilisateurs'),
  getOne: (id) => api.get(`/utilisateurs/${id}`),
}

export default api