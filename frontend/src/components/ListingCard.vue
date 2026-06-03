<template>
  <RouterLink :to="`/annonces/${listing.id}`" class="listing-card" @mousemove="onTilt" @mouseleave="resetTilt" ref="cardEl">
    <!-- Image -->
    <div class="card-img">
      <img :src="imgUrl" :alt="listing.title" loading="lazy" @error="onImgError" />
      <div class="card-badge" v-if="listing.availableFrom">
        <span :class="['badge', listing.isBooked ? 'badge-accent' : 'badge-success']">
          {{ listing.isBooked ? 'Réservé' : 'Disponible' }}
        </span>
      </div>
      <button v-if="auth.isLoggedIn" class="fav-btn" @click.prevent="toggleFav" :class="{ active: isFav }">
        {{ isFav ? '♥' : '♡' }}
      </button>
    </div>
    <!-- Body -->
    <div class="card-body">
      <div class="card-city">
        <span class="city-dot">📍</span> {{ listing.city }}
      </div>
      <h3 class="card-title">{{ listing.title }}</h3>
      <p class="card-desc" v-if="listing.description">{{ truncate(listing.description, 80) }}</p>
      <div class="card-footer">
        <div class="card-price">
          <span class="price-amount">{{ formatPrice(listing.pricePerNight) }} €</span>
          <span class="price-unit">/nuit</span>
        </div>
        <div class="card-owner" v-if="listing.owner">
          <div class="owner-avatar">{{ ownerInitials }}</div>
          <span>{{ listing.owner.firstName }}</span>
        </div>
      </div>
      <div class="card-dates" v-if="listing.availableFrom">
        <span>{{ formatDate(listing.availableFrom) }}</span>
        <span v-if="listing.availableTo"> → {{ formatDate(listing.availableTo) }}</span>
      </div>
    </div>
  </RouterLink>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFavoritesStore } from '@/stores/favorites'
import { useAuthStore } from '@/stores/auth'

const cardEl = ref(null)

function onTilt(e) {
  const el = cardEl.value?.$el ?? cardEl.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width  - 0.5
  const y = (e.clientY - rect.top)  / rect.height - 0.5
  el.style.transform = `perspective(900px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) scale(1.03)`
}

function resetTilt() {
  const el = cardEl.value?.$el ?? cardEl.value
  if (el) el.style.transform = ''
}

const props = defineProps({ listing: { type: Object, required: true } })

const auth = useAuthStore()
const favStore = useFavoritesStore()

const FALLBACK_IMGS = [
  // Modern apartments
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=280&fit=crop',
  // Cozy / Scandinavian
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=280&fit=crop',
  // Studios / small spaces
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=400&h=280&fit=crop',
  // Lofts / industrial
  'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=400&h=280&fit=crop',
  // Kitchens / dining
  'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=400&h=280&fit=crop',
  // Bedrooms
  'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=280&fit=crop',
  // Living rooms
  'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=280&fit=crop',
]
const imgUrl = ref(
  props.listing.images?.length
    ? `/api${props.listing.images[0].url}`
    : FALLBACK_IMGS[props.listing.id % FALLBACK_IMGS.length] || FALLBACK_IMGS[0]
)

const isFav = computed(() => favStore.isFav(props.listing.id))

function onImgError() { imgUrl.value = FALLBACK_IMGS[0] }
async function toggleFav() {
  if (!auth.isLoggedIn) return
  if (!favStore.loaded) await favStore.load()
  await favStore.toggle(props.listing.id)
}
function truncate(str, n) { return str.length > n ? str.slice(0, n) + '…' : str }
function formatPrice(p) { return Number(p).toLocaleString('fr-FR') }
function formatDate(d) { return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) }

const ownerInitials = computed(() => {
  if (!props.listing.owner) return '?'
  return `${props.listing.owner.firstName?.[0] || ''}${props.listing.owner.lastName?.[0] || ''}`.toUpperCase()
})
</script>

<style scoped>
.listing-card { display: block; background: var(--white); border-radius: var(--radius); border: 1px solid var(--border); overflow: hidden; transition: all .25s ease; text-decoration: none; color: inherit; }
.listing-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-6px); }
.card-img { position: relative; height: 200px; overflow: hidden; background: var(--bg); }
.card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform .4s ease; }
.listing-card:hover .card-img img { transform: scale(1.06); }
.card-badge { position: absolute; top: 12px; left: 12px; }
.fav-btn { position: absolute; top: 12px; right: 12px; width: 34px; height: 34px; border-radius: 50%; background: rgba(255,255,255,.9); border: none; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all var(--transition); color: #ccc; }
.fav-btn:hover, .fav-btn.active { color: #e74c3c; background: #fff; transform: scale(1.1); }
.card-body { padding: 16px; }
.card-city { font-size: .8rem; color: var(--text-muted); margin-bottom: 6px; display: flex; align-items: center; gap: 4px; }
.card-title { font-size: 1rem; font-weight: 700; color: var(--text); margin-bottom: 6px; line-height: 1.3; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.card-desc { font-size: .85rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5; }
.card-footer { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.card-price { display: flex; align-items: baseline; gap: 2px; }
.price-amount { font-size: 1.25rem; font-weight: 800; color: var(--primary); }
.price-unit { font-size: .8rem; color: var(--text-muted); }
.card-owner { display: flex; align-items: center; gap: 6px; font-size: .8rem; color: var(--text-muted); }
.owner-avatar { width: 26px; height: 26px; border-radius: 50%; background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: .7rem; font-weight: 700; }
.card-dates { font-size: .78rem; color: var(--text-muted); background: var(--bg); padding: 6px 10px; border-radius: 6px; }
</style>