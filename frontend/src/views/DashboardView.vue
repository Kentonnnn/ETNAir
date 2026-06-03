<template>
  <div class="dashboard">
    <div class="dash-header">
      <div class="container">
        <div class="dash-header-inner">
          <div>
            <p class="dash-greeting">Bonjour, {{ auth.user?.firstName }} 👋</p>
            <h1>Mon tableau de bord</h1>
            <p class="dash-sub">{{ roleLabel }}</p>
          </div>
          <RouterLink v-if="auth.isOwner" to="/annonces/create" class="btn btn-accent btn-lg">
            + Publier une annonce
          </RouterLink>
        </div>
        <!-- Stats -->
        <div class="dash-stats">
          <div class="stat-card" v-for="s in statCards" :key="s.label">
            <span class="stat-icon">{{ s.icon }}</span>
            <div>
              <strong>{{ s.value }}</strong>
              <span>{{ s.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container dash-body">
      <!-- Tabs -->
      <div class="tabs">
        <button v-for="t in tabs" :key="t.key" :class="['tab', { active: activeTab === t.key }]" @click="activeTab = t.key">
          {{ t.icon }} {{ t.label }}
        </button>
      </div>

      <!-- My Listings tab -->
      <div v-if="activeTab === 'listings'">
        <div v-if="loadingListings" class="page-loader"><div class="spinner"></div></div>
        <div v-else-if="myListings.length === 0" class="empty-dash">
          <div class="empty-icon">🏠</div>
          <h3>Aucune annonce publiée</h3>
          <p>Publiez votre première annonce et commencez à louer !</p>
          <RouterLink to="/annonces/create" class="btn btn-primary">Publier maintenant</RouterLink>
        </div>
        <div v-else class="dash-listings">
          <div class="dash-listing-row" v-for="l in myListings" :key="l.id">
            <img :src="getImg(l)" :alt="l.title" class="row-img" />
            <div class="row-info">
              <h3>{{ l.title }}</h3>
              <p class="row-city">📍 {{ l.city }}</p>
              <p class="row-price"><strong>{{ formatPrice(l.pricePerNight) }} €</strong>/nuit</p>
            </div>
            <div class="row-status">
              <span :class="['badge', listingIsBooked(l.id) ? 'badge-accent' : 'badge-success']">
                {{ listingIsBooked(l.id) ? 'Réservée' : 'Active' }}
              </span>
            </div>
            <div class="row-actions">
              <RouterLink :to="`/annonces/${l.id}`" class="btn btn-outline btn-sm">Voir</RouterLink>
              <RouterLink :to="`/annonces/${l.id}/edit`" class="btn btn-outline btn-sm">Modifier</RouterLink>
              <button class="btn btn-sm" style="color:var(--danger);border:1px solid var(--danger)" @click="deleteListing(l.id)">Supprimer</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Favorites tab -->
      <div v-if="activeTab === 'favorites'" class="favorites-section">
        <div v-if="loadingFavs" class="page-loader"><div class="spinner"></div></div>
        <div v-else-if="favListings.length === 0" class="empty-dash">
          <div class="empty-icon">♡</div>
          <h3>Aucun favori pour l'instant</h3>
          <p>Cliquez sur le cœur d'une annonce pour l'ajouter ici.</p>
          <RouterLink to="/annonces" class="btn btn-primary">Explorer les logements</RouterLink>
        </div>
        <div v-else>
          <div class="fav-tab-header">
            <span>{{ favListings.length }} annonce{{ favListings.length !== 1 ? 's' : '' }} sauvegardée{{ favListings.length !== 1 ? 's' : '' }}</span>
            <RouterLink to="/favoris" class="btn btn-outline btn-sm">Voir en pleine page →</RouterLink>
          </div>
          <div class="dash-listings">
            <div class="dash-listing-row" v-for="l in favListings" :key="l.id">
              <img :src="getImg(l)" :alt="l.title" class="row-img" />
              <div class="row-info">
                <h3>{{ l.title }}</h3>
                <p class="row-city">📍 {{ l.city }}</p>
                <p class="row-price"><strong>{{ formatPrice(l.pricePerNight) }} €</strong>/nuit</p>
              </div>
              <div class="row-actions">
                <RouterLink :to="`/annonces/${l.id}`" class="btn btn-outline btn-sm">Voir</RouterLink>
                <button class="btn btn-sm" style="color:#e74c3c;border:1px solid #e74c3c" @click="removeFav(l.id)">♥ Retirer</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- My Bookings tab (tenant) -->
      <div v-if="activeTab === 'bookings'">
        <div v-if="bookStore.loading" class="page-loader"><div class="spinner"></div></div>
        <div v-else-if="bookStore.myBookings.length === 0" class="empty-dash">
          <div class="empty-icon">🗓️</div>
          <h3>Aucune réservation</h3>
          <p>Trouvez un logement et faites votre première demande !</p>
          <RouterLink to="/annonces" class="btn btn-primary">Explorer les logements</RouterLink>
        </div>
        <div v-else class="dash-listings">
          <div class="dash-listing-row" v-for="b in bookStore.myBookings" :key="b.id">
            <img :src="getImg(b.listing)" :alt="b.listing.title" class="row-img" />
            <div class="row-info">
              <h3>{{ b.listing.title }}</h3>
              <p class="row-city">📍 {{ b.listing.city }}</p>
              <p class="row-price">{{ formatDate(b.startDate) }} → {{ formatDate(b.endDate) }} · <strong>{{ calcNights(b.startDate, b.endDate) }} nuit(s)</strong></p>
              <p class="row-price">Total : <strong>{{ formatPrice(b.totalPrice) }} €</strong></p>
            </div>
            <div class="row-status">
              <span :class="['badge', bookingStatusClass(b.status)]">{{ bookingStatusLabel(b.status) }}</span>
            </div>
            <div class="row-actions">
              <RouterLink :to="`/annonces/${b.listing.id}`" class="btn btn-outline btn-sm">Voir</RouterLink>
              <button v-if="canCancel(b)" class="btn btn-sm" style="color:var(--danger);border:1px solid var(--danger)"
                @click="handleCancel(b.id)" :disabled="cancellingId === b.id">
                {{ cancellingId === b.id ? '...' : 'Annuler' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Received bookings tab (owner) -->
      <div v-if="activeTab === 'received'">
        <div v-if="bookStore.loading" class="page-loader"><div class="spinner"></div></div>
        <div v-else-if="bookStore.received.length === 0" class="empty-dash">
          <div class="empty-icon">📬</div>
          <h3>Aucune réservation reçue</h3>
          <p>Les demandes de vos locataires apparaîtront ici.</p>
        </div>
        <div v-else class="dash-listings">
          <div class="dash-listing-row" v-for="b in bookStore.received" :key="b.id">
            <img :src="getImg(b.listing)" :alt="b.listing.title" class="row-img" />
            <div class="row-info">
              <h3>{{ b.listing.title }}</h3>
              <p class="row-city">👤 {{ b.user.firstName }} {{ b.user.lastName }} · {{ b.user.email }}</p>
              <p class="row-price">{{ formatDate(b.startDate) }} → {{ formatDate(b.endDate) }} · <strong>{{ calcNights(b.startDate, b.endDate) }} nuit(s)</strong></p>
              <p class="row-price">Total : <strong>{{ formatPrice(b.totalPrice) }} €</strong></p>
            </div>
            <div class="row-status">
              <span :class="['badge', bookingStatusClass(b.status)]">{{ bookingStatusLabel(b.status) }}</span>
            </div>
            <div class="row-actions">
              <button v-if="b.status === 'pending'" class="btn btn-primary btn-sm"
                @click="handleConfirm(b.id)" :disabled="confirmingId === b.id">
                {{ confirmingId === b.id ? '...' : 'Confirmer' }}
              </button>
              <button v-if="canCancel(b)" class="btn btn-sm" style="color:var(--danger);border:1px solid var(--danger)"
                @click="handleCancel(b.id)" :disabled="cancellingId === b.id">
                {{ cancellingId === b.id ? '...' : 'Refuser' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile tab -->
      <div v-if="activeTab === 'profile'" class="profile-section">
        <div class="profile-card">
          <div class="profile-avatar-edit" @click="$refs.picInput.click()" :title="pic ? 'Changer la photo' : 'Ajouter une photo'">
            <img v-if="pic" :src="pic" alt="Photo de profil" />
            <span v-else>{{ initials }}</span>
            <div class="avatar-overlay"><span>📷</span></div>
            <input ref="picInput" type="file" accept="image/*" style="display:none" @change="onPicChange" />
          </div>
          <div class="profile-info">
            <h2>{{ auth.user?.firstName }} {{ auth.user?.lastName }}</h2>
            <p>{{ auth.user?.email }}</p>
            <span class="badge badge-primary">{{ roleLabel }}</span>
            <div v-if="pic" class="avatar-actions">
              <button class="btn btn-sm btn-outline" @click="$refs.picInput.click()">Changer la photo</button>
              <button class="btn btn-sm" style="color:var(--danger);border:1px solid var(--danger)" @click="removePic">Supprimer</button>
            </div>
          </div>
        </div>
        <div class="profile-fields">
          <div class="field-row">
            <span class="field-label">Prénom</span>
            <span>{{ auth.user?.firstName }}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Nom</span>
            <span>{{ auth.user?.lastName }}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Email</span>
            <span>{{ auth.user?.email }}</span>
          </div>
          <div class="field-row">
            <span class="field-label">Rôle</span>
            <span>{{ roleLabel }}</span>
          </div>
        </div>
        <button class="btn btn-danger" @click="handleLogout">Se déconnecter</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFavoritesStore } from '@/stores/favorites'
import { useBookingsStore } from '@/stores/bookings'
import { listingService, userService, favoriteService } from '@/services/api'
import { useProfilePic } from '@/stores/profilePic'

const auth = useAuthStore()
const favStore = useFavoritesStore()
const bookStore = useBookingsStore()
const { pic, setPic, removePic } = useProfilePic()

function onPicChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    showToast?.('Image trop lourde (max 2 Mo)', 'error')
    return
  }
  const reader = new FileReader()
  reader.onload = ev => {
    setPic(ev.target.result)
    showToast?.('Photo de profil mise à jour', 'success')
  }
  reader.readAsDataURL(file)
  e.target.value = ''
}
const router = useRouter()
const showToast = inject('showToast')

const myListings = ref([])
const loadingListings = ref(true)
const favListings = ref([])
const loadingFavs = ref(false)
const activeTab = ref('listings')

const roleLabel = computed(() => ({ tenant: 'Locataire', owner: 'Propriétaire', admin: 'Administrateur' }[auth.user?.role] || 'Utilisateur')  )
const initials = computed(() => `${auth.user?.firstName?.[0] || ''}${auth.user?.lastName?.[0] || ''}`.toUpperCase())

const tabs = computed(() => {
  const t = [
    { key: 'profile',    icon: '👤', label: 'Mon profil' },
    { key: 'favorites',  icon: '♥',  label: 'Mes favoris' },
    { key: 'bookings',   icon: '🗓️', label: 'Mes réservations' },
  ]
  if (auth.isOwner) {
    t.unshift({ key: 'listings', icon: '🏠', label: 'Mes annonces' })
    t.push({ key: 'received', icon: '📬', label: 'Réservations reçues' })
  }
  return t
})

const statCards = computed(() => [
  { icon: '🏠', label: 'Annonces', value: myListings.value.length },
  { icon: '📅', label: 'Mes réservations', value: bookStore.myBookings.length },
  { icon: '📬', label: 'Réservations reçues', value: bookStore.received.filter(b => b.status === 'pending').length },
])

const FALLBACK_IMGS = [
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=120&h=80&fit=crop',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=120&h=80&fit=crop',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=120&h=80&fit=crop',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=120&h=80&fit=crop',
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=120&h=80&fit=crop',
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=120&h=80&fit=crop',
  'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=120&h=80&fit=crop',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=120&h=80&fit=crop',
  'https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=120&h=80&fit=crop',
  'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=120&h=80&fit=crop',
]
function getImg(l) {
  return l.images?.length
    ? `/api${l.images[0].url}`
    : FALLBACK_IMGS[l.id % FALLBACK_IMGS.length]
}
function formatPrice(p) { return Number(p).toLocaleString('fr-FR') }

async function deleteListing(id) {
  if (!confirm('Supprimer cette annonce ?')) return
  try {
    await listingService.remove(id)
    myListings.value = myListings.value.filter(l => l.id !== id)
    showToast?.('Annonce supprimée', 'success')
  } catch (err) {
    showToast?.(err.response?.data?.error || 'Erreur lors de la suppression', 'error')
  }
}

const confirmingId = ref(null)
const cancellingId = ref(null)

async function handleConfirm(id) {
  confirmingId.value = id
  try {
    await bookStore.confirm(id)
    showToast?.('Réservation confirmée ✓', 'success')
  } catch (err) {
    showToast?.(err.response?.data?.error || 'Erreur', 'error')
  } finally { confirmingId.value = null }
}

async function handleCancel(id) {
  if (!confirm('Annuler cette réservation ?')) return
  cancellingId.value = id
  try {
    await bookStore.cancel(id)
    showToast?.('Réservation annulée', 'success')
  } catch (err) {
    showToast?.(err.response?.data?.error || 'Erreur', 'error')
  } finally { cancellingId.value = null }
}

function listingIsBooked(listingId) {
  const now = new Date()
  return bookStore.received.some(b =>
    b.listingId === listingId &&
    b.status === 'confirmed' &&
    new Date(b.endDate) > now
  )
}

function bookingStatusLabel(s) {
  return { pending: 'En attente', confirmed: 'Confirmée', cancelled: 'Annulée' }[s] ?? s
}
function bookingStatusClass(s) {
  return { pending: 'badge-accent', confirmed: 'badge-success', cancelled: 'badge-danger' }[s] ?? ''
}
function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}
function calcNights(s, e) { return Math.ceil((new Date(e) - new Date(s)) / 86400000) }
function canCancel(b) {
  if (b.status === 'cancelled') return false
  if (!b.cancelDeadline) return true
  return new Date() < new Date(b.cancelDeadline)
}

async function removeFav(listingId) {
  await favStore.toggle(listingId)
  favListings.value = favListings.value.filter(l => l.id !== listingId)
  showToast?.('Retiré des favoris', 'success')
}

function handleLogout() {
  favStore.reset()
  auth.logout()
  router.push('/')
}

onMounted(async () => {
  if (!auth.isOwner) { activeTab.value = 'bookings'; loadingListings.value = false }
  else {
    try {
      const { data } = await userService.getOne(auth.user.id)
      myListings.value = data.user?.listings ?? []
    } catch (e) { console.error('[dashboard] error:', e) }
    finally { loadingListings.value = false }
    bookStore.loadReceived()
  }

  loadingFavs.value = true
  try {
    await favStore.load()
    const { data } = await favoriteService.getAll()
    favListings.value = data.listings
  } catch {}
  finally { loadingFavs.value = false }

  bookStore.loadMine()
})
</script>

<style scoped>
@import "../assets/css/dashboard.css";
</style>
