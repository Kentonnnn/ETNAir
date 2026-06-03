<template>
  <div class="detail-page" v-if="!loading && listing">
    <!-- Breadcrumb -->
    <div class="breadcrumb-bar">
      <div class="container">
        <nav class="breadcrumb">
          <RouterLink to="/">Accueil</RouterLink> /
          <RouterLink to="/annonces">Logements</RouterLink> /
          <span>{{ listing.title }}</span>
        </nav>
      </div>
    </div>

    <div class="container">
      <!-- Gallery -->
      <div class="gallery">
        <div class="gallery-main">
          <img :src="mainImg" :alt="listing.title" />
          <div class="gallery-badge">
            <span :class="['badge', isBooked ? 'badge-accent' : 'badge-success']">
              {{ isBooked ? 'Réservé' : 'Disponible' }}
            </span>
          </div>
        </div>
        <div class="gallery-thumbs">
          <img v-for="(img, i) in thumbImgs" :key="i" :src="img" alt="" @click="mainImg = img" :class="{ active: mainImg === img }" />
        </div>
      </div>

      <!-- Content -->
      <div class="detail-grid">
        <!-- Left -->
        <div class="detail-main">
          <div class="listing-meta">
            <span class="city-tag">📍 {{ listing.city }}</span>
            <span class="badge badge-primary">Appartement</span>
          </div>
          <h1 class="listing-title">{{ listing.title }}</h1>

          <!-- Price mobile -->
          <div class="price-mobile">
            <span class="price-big">{{ formatPrice(listing.pricePerNight) }} €</span>
            <span class="price-unit">/nuit</span>
          </div>

          <!-- Owner -->
          <div class="owner-card" v-if="listing.owner">
            <div class="owner-avatar-lg">{{ ownerInitials }}</div>
            <div>
              <div class="owner-name">{{ listing.owner.firstName }} {{ listing.owner.lastName }}</div>
              <div class="owner-label">Propriétaire · <a :href="`mailto:${listing.owner.email}`">{{ listing.owner.email }}</a></div>
            </div>
          </div>

          <!-- Description -->
          <div class="detail-section">
            <h2>À propos de ce logement</h2>
            <p v-if="listing.description">{{ listing.description }}</p>
            <p v-else class="text-muted">Aucune description disponible pour ce logement.</p>
          </div>

          <!-- Availability -->
          <div class="detail-section" v-if="listing.availableFrom">
            <h2>Disponibilités</h2>
            <div class="avail-grid">
              <div class="avail-item">
                <span class="avail-label">📅 Disponible du</span>
                <strong>{{ formatDate(listing.availableFrom) }}</strong>
              </div>
              <div class="avail-item" v-if="listing.availableTo">
                <span class="avail-label">📅 Jusqu'au</span>
                <strong>{{ formatDate(listing.availableTo) }}</strong>
              </div>
            </div>
          </div>

          <!-- Booked periods -->
          <div class="detail-section" v-if="confirmedPeriods.length > 0">
            <h2>Dates indisponibles</h2>
            <div class="booked-list">
              <div class="booked-item" v-for="(p, i) in confirmedPeriods" :key="i">
                <span class="badge badge-accent">Réservé</span>
                <span>{{ formatDate(p.startDate) }} → {{ formatDate(p.endDate) }}</span>
              </div>
            </div>
          </div>

          <!-- Features (fictitious for now) -->
          <div class="detail-section">
            <h2>Équipements</h2>
            <div class="amenities">
              <div class="amenity" v-for="a in amenities" :key="a">
                <span>✓</span> {{ a }}
              </div>
            </div>
          </div>

          <!-- Reviews -->
          <ReviewSection :listing-id="listing.id" />
        </div>

        <!-- Right: booking card -->
        <aside class="booking-card">
          <div class="price-row">
            <span class="price-big">{{ formatPrice(listing.pricePerNight) }} €</span>
            <span class="price-unit">/nuit</span>
          </div>

          <div class="booking-form" v-if="auth.isLoggedIn">
            <div class="date-range">
              <div class="date-field">
                <label>Arrivée</label>
                <input type="date" v-model="booking.from" class="form-input" :min="today" />
              </div>
              <div class="date-field">
                <label>Départ</label>
                <input type="date" v-model="booking.to" class="form-input" :min="booking.from || today" />
              </div>
            </div>
            <div class="booking-total" v-if="nbNights > 0">
              <div class="total-row">
                <span>{{ formatPrice(listing.pricePerNight) }} € × {{ nbNights }} nuit{{ nbNights > 1 ? 's' : '' }}</span>
                <strong>{{ formatPrice(Number(listing.pricePerNight) * nbNights) }} €</strong>
              </div>
              <div class="total-row total-final">
                <span>Total</span>
                <strong>{{ formatPrice(Number(listing.pricePerNight) * nbNights) }} €</strong>
              </div>
            </div>
            <div v-if="datesUnavailable" class="booking-unavailable">
              ⚠️ Ces dates sont déjà réservées
            </div>
            <button class="btn btn-primary btn-lg btn-block" @click="handleReserve"
              :disabled="nbNights <= 0 || datesUnavailable || bookingLoading">
              {{ bookingLoading ? 'Envoi...' : nbNights > 0 ? 'Demander la réservation' : 'Choisir des dates' }}
            </button>
            <p class="booking-note">Le propriétaire devra confirmer votre demande</p>
          </div>

          <div v-else class="booking-login">
            <p>Connectez-vous pour réserver ce logement</p>
            <RouterLink to="/login" class="btn btn-primary btn-lg btn-block">Se connecter</RouterLink>
            <RouterLink to="/register" class="btn btn-outline btn-lg btn-block" style="margin-top:8px">Créer un compte</RouterLink>
          </div>

          <!-- Owner actions -->
          <div class="owner-actions" v-if="auth.user?.id === listing.ownerId">
            <hr style="border-color:var(--border);margin:20px 0" />
            <p style="font-size:.85rem;color:var(--text-muted);margin-bottom:12px">Actions propriétaire</p>
            <RouterLink :to="`/dashboard`" class="btn btn-outline btn-block btn-sm">Gérer l'annonce</RouterLink>
            <button class="btn btn-sm btn-block" style="color:var(--danger);background:transparent;border:1px solid var(--danger);margin-top:8px" @click="handleDelete">
              Supprimer l'annonce
            </button>
          </div>
        </aside>
      </div>
    </div>
  </div>

  <div v-else-if="loading" class="page-loader" style="min-height:400px"><div class="spinner"></div></div>
  <div v-else class="container" style="padding:80px 24px;text-align:center">
    <h2>Annonce introuvable</h2>
    <RouterLink to="/annonces" class="btn btn-primary" style="margin-top:20px">Retour aux annonces</RouterLink>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { listingService, bookingService } from '@/services/api'
import ReviewSection from '@/components/ReviewSection.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const showToast = inject('showToast')

const listing = ref(null)
const loading = ref(true)
const booking = ref({ from: '', to: '' })
const bookingLoading = ref(false)
const bookedPeriods = ref([])
const today = new Date().toISOString().split('T')[0]

const IMGS = [
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&h=500&fit=crop',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=280&fit=crop',
]
const mainImg = ref(IMGS[0])
const thumbImgs = IMGS.slice(1)

const amenities = ['Wi-Fi haut débit', 'Meublé', 'Charges comprises', 'Cuisine équipée', 'Accès PMR', 'Digicode', 'Proche transports', 'Lave-linge']

const ownerInitials = computed(() => {
  if (!listing.value?.owner) return '?'
  return `${listing.value.owner.firstName?.[0] || ''}${listing.value.owner.lastName?.[0] || ''}`.toUpperCase()
})

const nbNights = computed(() => {
  if (!booking.value.from || !booking.value.to) return 0
  const d = (new Date(booking.value.to) - new Date(booking.value.from)) / 86400000
  return d > 0 ? d : 0
})

function formatPrice(p) { return Number(p).toLocaleString('fr-FR') }
function formatDate(d) { return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) }

const now = new Date()
const confirmedPeriods = computed(() =>
  bookedPeriods.value.filter(p => p.status === 'confirmed' && new Date(p.endDate) > now)
)
const isBooked = computed(() =>
  confirmedPeriods.value.some(p => new Date(p.startDate) <= now && new Date(p.endDate) > now)
)

const datesUnavailable = computed(() => {
  if (!booking.value.from || !booking.value.to) return false
  const s = new Date(booking.value.from)
  const e = new Date(booking.value.to)
  return bookedPeriods.value.some(p =>
    new Date(p.startDate) < e && new Date(p.endDate) > s
  )
})

async function handleReserve() {
  if (nbNights.value <= 0) return
  if (datesUnavailable.value) {
    showToast?.('Ces dates sont déjà réservées', 'error'); return
  }
  bookingLoading.value = true
  try {
    await bookingService.create({
      listingId: listing.value.id,
      startDate: booking.value.from,
      endDate: booking.value.to
    })
    showToast?.('Demande de réservation envoyée ! Le propriétaire va confirmer.', 'success')
    booking.value = { from: '', to: '' }
    // Refresh availability
    const { data } = await bookingService.getAvailability(listing.value.id)
    bookedPeriods.value = data.bookedDates
  } catch (err) {
    showToast?.(err.response?.data?.error || 'Erreur lors de la réservation', 'error')
  } finally {
    bookingLoading.value = false
  }
}

async function handleDelete() {
  if (!confirm('Supprimer cette annonce ?')) return
  try {
    await listingService.remove(route.params.id)
    showToast?.('Annonce supprimée', 'success')
    router.push('/dashboard')
  } catch { showToast?.('Erreur lors de la suppression', 'error') }
}

onMounted(async () => {
  try {
    const [listingRes, availRes] = await Promise.allSettled([
      listingService.getOne(route.params.id),
      bookingService.getAvailability(route.params.id)
    ])
    if (listingRes.status === 'fulfilled') listing.value = listingRes.value.data.listing
    if (availRes.status === 'fulfilled')   bookedPeriods.value = availRes.value.data.bookedDates
  } catch { /* 404 */ }
  finally { loading.value = false }
})
</script>

<style scoped>
@import "../assets/css/annonce-detail.css";
.booking-unavailable { background: #fef2f2; color: var(--danger); border: 1px solid #fecaca; border-radius: 8px; padding: 10px 14px; font-size: .9rem; margin-bottom: 12px; }
.booked-list { display: flex; flex-direction: column; gap: 10px; }
.booked-item { display: flex; align-items: center; gap: 12px; font-size: .9rem; color: var(--text-muted); }
:global([data-theme="dark"]) .owner-avatar-lg { background: #fff; color: #000; }
:global([data-theme="dark"]) .booking-unavailable { background: rgba(248,113,113,0.1); border-color: rgba(248,113,113,0.3); }
</style>
