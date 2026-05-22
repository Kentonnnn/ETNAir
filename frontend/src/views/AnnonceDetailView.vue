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
.breadcrumb-bar { background: var(--bg); border-bottom: 1px solid var(--border); padding: 14px 0; }
.breadcrumb { font-size: .85rem; color: var(--text-muted); display: flex; gap: 8px; align-items: center; }
.breadcrumb a { color: var(--primary); }
.gallery { display: grid; grid-template-columns: 1fr 200px; gap: 12px; margin: 32px 0; height: 420px; }
.gallery-main { position: relative; border-radius: var(--radius); overflow: hidden; }
.gallery-main img { width: 100%; height: 100%; object-fit: cover; }
.gallery-badge { position: absolute; top: 16px; left: 16px; }
.gallery-thumbs { display: flex; flex-direction: column; gap: 8px; }
.gallery-thumbs img { border-radius: var(--radius-sm); width: 100%; flex: 1; object-fit: cover; cursor: pointer; border: 2px solid transparent; transition: border-color var(--transition); }
.gallery-thumbs img.active, .gallery-thumbs img:hover { border-color: var(--primary); }
.detail-grid { display: grid; grid-template-columns: 1fr 380px; gap: 48px; padding-bottom: 80px; }
.listing-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.city-tag { font-size: .9rem; color: var(--text-muted); font-weight: 500; }
.listing-title { font-size: 2rem; font-weight: 800; color: var(--text); line-height: 1.2; margin-bottom: 20px; }
.price-mobile { display: none; margin-bottom: 20px; }
.owner-card { display: flex; align-items: center; gap: 16px; background: var(--bg); border-radius: var(--radius); padding: 16px 20px; margin-bottom: 32px; border: 1px solid var(--border); }
.owner-avatar-lg { width: 52px; height: 52px; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: 700; flex-shrink: 0; }
.owner-name { font-weight: 700; color: var(--text); margin-bottom: 2px; }
.owner-label { font-size: .85rem; color: var(--text-muted); }
.owner-label a { color: var(--primary); }
.detail-section { margin-bottom: 40px; }
.detail-section h2 { font-size: 1.2rem; font-weight: 700; color: var(--text); margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
.detail-section p { color: var(--text-muted); line-height: 1.8; }
.avail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.avail-item { background: var(--bg); border-radius: var(--radius-sm); padding: 14px 18px; }
.avail-label { display: block; font-size: .8rem; color: var(--text-muted); margin-bottom: 4px; }
.avail-item strong { font-size: 1rem; color: var(--text); }
.amenities { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.amenity { display: flex; align-items: center; gap: 8px; font-size: .9rem; color: var(--text-muted); }
.amenity span { color: var(--success); font-weight: 700; }
/* Booking card */
.booking-card { background: var(--white); border: 1px solid var(--border); border-radius: var(--radius); padding: 28px; box-shadow: var(--shadow-lg); height: fit-content; position: sticky; top: calc(var(--nav-h) + 24px); }
.price-row { display: flex; align-items: baseline; gap: 4px; margin-bottom: 24px; }
.price-big { font-size: 2rem; font-weight: 800; color: var(--primary); }
.price-unit { color: var(--text-muted); font-size: .95rem; }
.date-range { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; border: 1.5px solid var(--border); border-radius: var(--radius-sm); overflow: hidden; margin-bottom: 16px; }
.date-field { padding: 12px; }
.date-field label { display: block; font-size: .75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: .5px; margin-bottom: 4px; }
.date-field input { border: none; padding: 0; font-size: .9rem; }
.date-field input:focus { box-shadow: none; }
.booking-total { background: var(--bg); border-radius: var(--radius-sm); padding: 16px; margin-bottom: 16px; }
.total-row { display: flex; justify-content: space-between; font-size: .9rem; color: var(--text-muted); margin-bottom: 8px; }
.total-final { border-top: 1px solid var(--border); padding-top: 8px; margin-top: 4px; color: var(--text); font-size: 1rem; }
.booking-note { text-align: center; font-size: .8rem; color: var(--text-muted); margin-top: 12px; }
.booking-login p { color: var(--text-muted); font-size: .9rem; text-align: center; margin-bottom: 16px; }
@media (max-width: 1024px) { .detail-grid { grid-template-columns: 1fr; } .booking-card { position: static; } .price-mobile { display: flex; align-items: baseline; gap: 4px; } .booking-card .price-row { display: none; } }
@media (max-width: 700px) { .gallery { grid-template-columns: 1fr; height: 300px; } .gallery-thumbs { display: none; } .avail-grid, .amenities { grid-template-columns: 1fr; } }
</style>