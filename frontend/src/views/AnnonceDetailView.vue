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
            <span class="badge badge-success">Disponible</span>
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
            <button class="btn btn-primary btn-lg btn-block" @click="handleReserve" :disabled="nbNights <= 0">
              {{ nbNights > 0 ? 'Réserver' : 'Choisir des dates' }}
            </button>
            <p class="booking-note">Vous ne serez pas débité maintenant</p>
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
import { listingService } from '@/services/api'
import ReviewSection from '@/components/ReviewSection.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const showToast = inject('showToast')

const listing = ref(null)
const loading = ref(true)
const booking = ref({ from: '', to: '' })
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

function handleReserve() {
  showToast?.('Fonctionnalité de réservation bientôt disponible ! 🏠', 'success')
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
    const { data } = await listingService.getOne(route.params.id)
    listing.value = data.listing
  } catch { /* 404 */ }
  finally { loading.value = false }
})
</script>

<style scoped>
@import "../assets/css/annonce-detail.css";
</style>
