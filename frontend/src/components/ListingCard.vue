<template>
  <RouterLink :to="`/annonces/${listing.id}`" class="listing-card">
    <!-- Image -->
    <div class="card-img">
      <img :src="imgUrl" :alt="listing.title" loading="lazy" @error="onImgError" />
      <div class="card-badge" v-if="listing.availableFrom">
        <span class="badge badge-success">Disponible</span>
      </div>
      <button class="fav-btn" @click.prevent="toggleFav" :class="{ active: isFav }">
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

const props = defineProps({ listing: { type: Object, required: true } })

const FALLBACK_IMGS = [
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=280&fit=crop',
]
const imgUrl = ref(FALLBACK_IMGS[props.listing.id % FALLBACK_IMGS.length] || FALLBACK_IMGS[0])
const isFav = ref(false)

function onImgError() { imgUrl.value = FALLBACK_IMGS[0] }
function toggleFav() { isFav.value = !isFav.value }
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