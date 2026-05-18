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
            <img :src="getImg(l.id)" :alt="l.title" class="row-img" />
            <div class="row-info">
              <h3>{{ l.title }}</h3>
              <p class="row-city">📍 {{ l.city }}</p>
              <p class="row-price"><strong>{{ formatPrice(l.pricePerNight) }} €</strong>/nuit</p>
            </div>
            <div class="row-status">
              <span class="badge badge-success">Active</span>
            </div>
            <div class="row-actions">
              <RouterLink :to="`/annonces/${l.id}`" class="btn btn-outline btn-sm">Voir</RouterLink>
              <button class="btn btn-sm" style="color:var(--danger);border:1px solid var(--danger)" @click="deleteListing(l.id)">Supprimer</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile tab -->
      <div v-if="activeTab === 'profile'" class="profile-section">
        <div class="profile-card">
          <div class="profile-avatar">{{ initials }}</div>
          <div class="profile-info">
            <h2>{{ auth.user?.firstName }} {{ auth.user?.lastName }}</h2>
            <p>{{ auth.user?.email }}</p>
            <span class="badge badge-primary">{{ roleLabel }}</span>
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
import { listingService } from '@/services/api'

const auth = useAuthStore()
const router = useRouter()
const showToast = inject('showToast')

const myListings = ref([])
const loadingListings = ref(true)
const activeTab = ref('listings')

const roleLabel = computed(() => ({ tenant: 'Locataire', owner: 'Propriétaire', admin: 'Administrateur' }[auth.user?.role] || 'Utilisateur')  )
const initials = computed(() => `${auth.user?.firstName?.[0] || ''}${auth.user?.lastName?.[0] || ''}`.toUpperCase())

const tabs = computed(() => {
  const t = [{ key: 'profile', icon: '👤', label: 'Mon profil' }]
  if (auth.isOwner) t.unshift({ key: 'listings', icon: '🏠', label: 'Mes annonces' })
  return t
})

const statCards = computed(() => [
  { icon: '🏠', label: 'Annonces', value: myListings.value.length },
  { icon: '⭐', label: 'Avis', value: 0 },
  { icon: '📅', label: 'Réservations', value: 0 },
])

const IMGS = [
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=120&h=80&fit=crop',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=120&h=80&fit=crop',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=120&h=80&fit=crop',
]
function getImg(id) { return IMGS[id % IMGS.length] }
function formatPrice(p) { return Number(p).toLocaleString('fr-FR') }

async function deleteListing(id) {
  if (!confirm('Supprimer cette annonce ?')) return
  try {
    await listingService.remove(id)
    myListings.value = myListings.value.filter(l => l.id !== id)
    showToast?.('Annonce supprimée', 'success')
  } catch { showToast?.('Erreur lors de la suppression', 'error') }
}

function handleLogout() {
  auth.logout()
  router.push('/')
}

onMounted(async () => {
  if (!auth.isOwner) { activeTab.value = 'profile'; loadingListings.value = false; return }
  try {
    const { data } = await listingService.getAll()
    myListings.value = data.filter(l => l.ownerId === auth.user?.id || l.owner?.id === auth.user?.id)
  } catch { /* API non dispo */ }
  finally { loadingListings.value = false }
})
</script>

<style scoped>
.dash-header { background: linear-gradient(135deg, var(--primary-dark), var(--primary)); color: #fff; padding: 48px 0 80px; }
.dash-header-inner { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
.dash-greeting { font-size: .95rem; opacity: .8; margin-bottom: 4px; }
.dash-header h1 { font-size: 2rem; font-weight: 800; margin-bottom: 4px; }
.dash-sub { opacity: .75; }
.dash-stats { display: flex; gap: 16px; flex-wrap: wrap; }
.stat-card { background: rgba(255,255,255,.15); border-radius: var(--radius); padding: 20px 28px; display: flex; align-items: center; gap: 16px; backdrop-filter: blur(10px); }
.stat-icon { font-size: 1.8rem; }
.stat-card strong { display: block; font-size: 1.5rem; font-weight: 800; }
.stat-card span { font-size: .85rem; opacity: .8; }
.dash-body { margin-top: -40px; padding-bottom: 80px; }
.tabs { display: flex; gap: 4px; background: var(--white); border-radius: var(--radius); padding: 6px; box-shadow: var(--shadow); margin-bottom: 32px; width: fit-content; }
.tab { padding: 10px 20px; border-radius: var(--radius-sm); border: none; background: transparent; font-family: var(--font); font-size: .9rem; font-weight: 600; color: var(--text-muted); cursor: pointer; transition: all var(--transition); }
.tab.active { background: var(--primary); color: #fff; }
.empty-dash { text-align: center; padding: 80px 0; }
.empty-dash .empty-icon { font-size: 4rem; margin-bottom: 16px; }
.empty-dash h3 { font-size: 1.2rem; font-weight: 700; margin-bottom: 8px; }
.empty-dash p { color: var(--text-muted); margin-bottom: 24px; }
.dash-listings { display: flex; flex-direction: column; gap: 12px; }
.dash-listing-row { display: flex; align-items: center; gap: 20px; background: var(--white); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px 20px; transition: box-shadow var(--transition); }
.dash-listing-row:hover { box-shadow: var(--shadow); }
.row-img { width: 90px; height: 70px; border-radius: var(--radius-sm); object-fit: cover; flex-shrink: 0; }
.row-info { flex: 1; }
.row-info h3 { font-weight: 700; color: var(--text); margin-bottom: 4px; }
.row-city { font-size: .85rem; color: var(--text-muted); margin-bottom: 4px; }
.row-price { font-size: .9rem; color: var(--text-muted); }
.row-actions { display: flex; gap: 8px; }
/* Profile */
.profile-section { max-width: 600px; }
.profile-card { display: flex; align-items: center; gap: 24px; background: var(--white); border-radius: var(--radius); border: 1px solid var(--border); padding: 28px; margin-bottom: 24px; }
.profile-avatar { width: 80px; height: 80px; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; font-weight: 800; flex-shrink: 0; }
.profile-info h2 { font-size: 1.3rem; font-weight: 700; margin-bottom: 4px; }
.profile-info p { color: var(--text-muted); font-size: .9rem; margin-bottom: 8px; }
.profile-fields { background: var(--white); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; margin-bottom: 24px; }
.field-row { display: flex; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid var(--border); font-size: .9rem; }
.field-row:last-child { border-bottom: none; }
.field-label { color: var(--text-muted); font-weight: 500; }
.btn-danger { background: var(--danger); color: #fff; }
@media (max-width: 700px) { .dash-header-inner { flex-direction: column; gap: 16px; } .dash-listing-row { flex-wrap: wrap; } .row-status { display: none; } }
</style>