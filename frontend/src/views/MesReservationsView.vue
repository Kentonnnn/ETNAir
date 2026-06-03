<template>
  <div class="reservations-page">
    <div class="container">
      <div class="page-header">
        <h1>Mes réservations</h1>
        <p class="text-muted">Historique de toutes vos demandes de séjour</p>
      </div>

      <!-- Filtres -->
      <div class="res-filters">
        <button v-for="f in filters" :key="f.key"
          :class="['filter-btn', { active: activeFilter === f.key }]"
          @click="activeFilter = f.key">
          {{ f.label }}
          <span class="filter-count">{{ countByStatus(f.key) }}</span>
        </button>
      </div>

      <div v-if="loading" class="page-loader"><div class="spinner"></div></div>

      <div v-else-if="filtered.length === 0" class="empty-state">
        <div class="empty-icon">🗓️</div>
        <h3>Aucune réservation</h3>
        <p>Vous n'avez pas encore de réservations dans cette catégorie.</p>
        <RouterLink to="/annonces" class="btn btn-primary">Trouver un logement</RouterLink>
      </div>

      <div v-else class="res-list">
        <div class="res-card" v-for="b in filtered" :key="b.id">
          <img :src="getImg(b.listing)" :alt="b.listing.title" class="res-img" />
          <div class="res-info">
            <div class="res-title-row">
              <h3>{{ b.listing.title }}</h3>
              <span :class="['badge', statusClass(b.status)]">{{ statusLabel(b.status) }}</span>
            </div>
            <p class="res-city">📍 {{ b.listing.city }}</p>
            <div class="res-dates">
              <span>📅 {{ formatDate(b.startDate) }} → {{ formatDate(b.endDate) }}</span>
              <span class="res-nights">{{ calcNights(b.startDate, b.endDate) }} nuit{{ calcNights(b.startDate, b.endDate) > 1 ? 's' : '' }}</span>
            </div>
            <p class="res-price">Total : <strong>{{ formatPrice(b.totalPrice) }} €</strong></p>
            <p v-if="b.listing.owner" class="res-owner">
              Propriétaire : {{ b.listing.owner.firstName }} {{ b.listing.owner.lastName }}
            </p>
            <p v-if="b.cancelDeadline && b.status !== 'cancelled'" class="res-deadline">
              Annulation possible jusqu'au {{ formatDate(b.cancelDeadline) }}
            </p>
          </div>
          <div class="res-actions">
            <RouterLink :to="`/annonces/${b.listing.id}`" class="btn btn-outline btn-sm">Voir l'annonce</RouterLink>
            <button v-if="canCancel(b)" class="btn btn-sm btn-danger-outline" @click="handleCancel(b.id)" :disabled="cancelling === b.id">
              {{ cancelling === b.id ? 'Annulation...' : 'Annuler' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useBookingsStore } from '@/stores/bookings'

const store = useBookingsStore()
const showToast = inject('showToast')
const activeFilter = ref('all')
const cancelling = ref(null)

const filters = [
  { key: 'all',       label: 'Toutes' },
  { key: 'pending',   label: 'En attente' },
  { key: 'confirmed', label: 'Confirmées' },
  { key: 'cancelled', label: 'Annulées' },
]

const loading = computed(() => store.loading)
const filtered = computed(() => {
  if (activeFilter.value === 'all') return store.myBookings
  return store.myBookings.filter(b => b.status === activeFilter.value)
})

function countByStatus(key) {
  if (key === 'all') return store.myBookings.length
  return store.myBookings.filter(b => b.status === key).length
}

function canCancel(b) {
  if (b.status === 'cancelled') return false
  if (!b.cancelDeadline) return true
  return new Date() < new Date(b.cancelDeadline)
}

function statusLabel(s) {
  return { pending: 'En attente', confirmed: 'Confirmée', cancelled: 'Annulée' }[s] ?? s
}
function statusClass(s) {
  return { pending: 'badge-accent', confirmed: 'badge-success', cancelled: 'badge-danger' }[s] ?? ''
}
function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}
function formatPrice(p) { return Number(p).toLocaleString('fr-FR') }
function calcNights(s, e) { return Math.ceil((new Date(e) - new Date(s)) / 86400000) }

const FALLBACK = 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=200&h=140&fit=crop'
function getImg(listing) {
  return listing?.images?.length ? `/api${listing.images[0].url}` : FALLBACK
}

async function handleCancel(id) {
  if (!confirm('Annuler cette réservation ?')) return
  cancelling.value = id
  try {
    await store.cancel(id)
    showToast?.('Réservation annulée', 'success')
  } catch (err) {
    showToast?.(err.response?.data?.error || 'Erreur lors de l\'annulation', 'error')
  } finally { cancelling.value = null }
}

onMounted(() => store.loadMine())
</script>

<style scoped>
.reservations-page { padding: 40px 0 80px; }
.page-header { margin-bottom: 32px; }
.page-header h1 { font-size: 1.8rem; font-weight: 700; color: var(--text); margin-bottom: 4px; }

.res-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 28px; }
.filter-btn { padding: 8px 16px; border-radius: 50px; border: 1.5px solid var(--border); background: transparent; color: var(--text-muted); font-size: .9rem; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all .2s; }
.filter-btn.active { border-color: var(--primary); background: var(--primary-light); color: var(--primary); font-weight: 600; }
.filter-count { background: var(--border); color: var(--text-muted); border-radius: 50px; padding: 1px 7px; font-size: .75rem; }
.filter-btn.active .filter-count { background: var(--primary); color: #fff; }

.empty-state { text-align: center; padding: 60px 24px; }
.empty-icon { font-size: 3rem; margin-bottom: 16px; }
.empty-state h3 { font-size: 1.3rem; font-weight: 700; color: var(--text); margin-bottom: 8px; }
.empty-state p { color: var(--text-muted); margin-bottom: 24px; }

.res-list { display: flex; flex-direction: column; gap: 16px; }
.res-card { display: flex; gap: 20px; background: var(--white); border-radius: var(--radius); border: 1px solid var(--border); padding: 20px; transition: box-shadow .2s; }
.res-card:hover { box-shadow: var(--shadow); }
.res-img { width: 120px; height: 90px; object-fit: cover; border-radius: var(--radius-sm); flex-shrink: 0; }
.res-info { flex: 1; min-width: 0; }
.res-title-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 4px; }
.res-title-row h3 { font-size: 1rem; font-weight: 700; color: var(--text); margin: 0; }
.res-city { font-size: .85rem; color: var(--text-muted); margin-bottom: 8px; }
.res-dates { display: flex; align-items: center; gap: 12px; font-size: .9rem; color: var(--text); margin-bottom: 4px; }
.res-nights { color: var(--text-muted); font-size: .85rem; }
.res-price { font-size: .9rem; color: var(--text-muted); margin-bottom: 4px; }
.res-owner { font-size: .85rem; color: var(--text-muted); }
.res-deadline { font-size: .8rem; color: var(--accent-dark); margin-top: 6px; }
.res-actions { display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; justify-content: center; }
.btn-danger-outline { color: var(--danger); border: 1px solid var(--danger); background: transparent; }
.btn-danger-outline:hover { background: var(--danger); color: #fff; }
.badge-danger { background: #fef2f2; color: var(--danger); }

@media (max-width: 600px) {
  .res-card { flex-direction: column; }
  .res-img { width: 100%; height: 160px; }
  .res-actions { flex-direction: row; }
}
</style>
