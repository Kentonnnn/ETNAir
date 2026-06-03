<template>
  <div class="annonces-page">
    <!-- Header -->
    <div class="page-header">
      <div class="container">
        <h1>Nos <span>logements</span></h1>
        <p>Trouvez le logement qui vous correspond parmi nos annonces</p>
        <SearchBar @search="applyFilters" />
      </div>
    </div>

    <div class="container page-body">
      <!-- Filters sidebar -->
      <aside class="filters">
        <div class="filter-panel">
          <h3 class="filter-title">Filtres</h3>

          <div class="filter-group">
            <label class="filter-label">Ville</label>
            <input v-model="filters.city" class="form-input" placeholder="Toutes les villes" @input="applyFilters(filters)" />
          </div>

          <div class="filter-group">
            <label class="filter-label">Prix max / nuit</label>
            <input v-model.number="filters.maxPrice" type="number" min="0" class="form-input" placeholder="Illimité" @input="applyFilters(filters)" />
          </div>

          <div class="filter-group">
            <label class="filter-label">Trier par</label>
            <select v-model="filters.sort" class="form-input" @change="applyFilters(filters)">
              <option value="recent">Plus récent</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
            </select>
          </div>

          <button class="btn btn-outline btn-block" @click="resetFilters">Réinitialiser</button>
        </div>

        <!-- Owner CTA -->
        <div class="owner-cta" v-if="auth.isOwner">
          <span class="owner-cta-icon">🏠</span>
          <h4>Vous êtes propriétaire</h4>
          <p>Publiez votre annonce gratuitement</p>
          <RouterLink to="/annonces/create" class="btn btn-primary btn-block">Publier une annonce</RouterLink>
        </div>
      </aside>

      <!-- Main content -->
      <main class="listings-main">
        <!-- Results bar -->
        <div class="results-bar">
          <span class="results-count">
            <strong>{{ filtered.length }}</strong> logement{{ filtered.length > 1 ? 's' : '' }}
            <span v-if="filters.city"> à {{ filters.city }}</span>
          </span>
          <div class="view-toggle">
            <button :class="['view-btn', { active: viewMode === 'grid' }]" @click="viewMode = 'grid'" title="Grille">⊞</button>
            <button :class="['view-btn', { active: viewMode === 'list' }]" @click="viewMode = 'list'" title="Liste">☰</button>
            <button :class="['view-btn', { active: viewMode === 'map' }]" @click="viewMode = 'map'" title="Carte">🗺</button>
          </div>
        </div>

        <!-- Loading skeleton -->
        <div v-if="loading" :class="viewMode === 'grid' ? 'grid-3' : 'list-view'">
          <SkeletonCard v-for="n in 6" :key="n" />
        </div>

        <!-- Error -->
        <div v-else-if="error" class="alert alert-error">{{ error }}</div>

        <!-- Map view -->
        <MapView v-else-if="viewMode === 'map'" :listings="filtered" />

        <!-- Empty -->
        <div v-else-if="filtered.length === 0" class="empty">
          <div style="font-size:4rem;margin-bottom:16px;">🔍</div>
          <h3>Aucun logement trouvé</h3>
          <p>Essayez de modifier vos critères de recherche</p>
          <button class="btn btn-outline" @click="resetFilters">Réinitialiser les filtres</button>
        </div>

        <!-- Grid / List -->
        <div v-else :class="viewMode === 'grid' ? 'grid-3' : 'list-view'">
          <div v-for="(l, i) in paginated" :key="l.id"
            v-reveal="'scale'" :data-delay="(i % 6) * 80">
            <ListingCard :listing="l" />
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination" v-if="totalPages > 1 && viewMode !== 'map'">
          <button class="page-btn" :disabled="page <= 1" @click="page--">← Précédent</button>
          <div class="page-nums">
            <template v-for="(p, i) in visiblePages" :key="i">
              <span v-if="p === '...'" class="page-ellipsis">…</span>
              <button v-else :class="['page-num', { active: page === p }]" @click="page = p">{{ p }}</button>
            </template>
          </div>
          <button class="page-btn" :disabled="page >= totalPages" @click="page++">Suivant →</button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { listingService } from '@/services/api'
import SearchBar from '@/components/SearchBar.vue'
import ListingCard from '@/components/ListingCard.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import MapView from '@/components/MapView.vue'

const route = useRoute()
const auth = useAuthStore()

const allListings = ref([])
const loading = ref(true)
const error = ref(null)
const viewMode = ref('grid')
const page = ref(1)
const PER_PAGE = 9

const filters = reactive({ city: route.query.city || '', maxPrice: route.query.maxPrice || null, sort: 'recent' })

const filtered = computed(() => {
  let list = [...allListings.value]
  if (filters.city) list = list.filter(l => l.city?.toLowerCase().includes(filters.city.toLowerCase()))
  if (filters.maxPrice) list = list.filter(l => Number(l.pricePerNight) <= Number(filters.maxPrice))
  if (filters.sort === 'price_asc') list.sort((a, b) => a.pricePerNight - b.pricePerNight)
  else if (filters.sort === 'price_desc') list.sort((a, b) => b.pricePerNight - a.pricePerNight)
  else list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  return list
})

const totalPages = computed(() => Math.ceil(filtered.value.length / PER_PAGE))
const paginated = computed(() => filtered.value.slice((page.value - 1) * PER_PAGE, page.value * PER_PAGE))

// Compact pagination: 1 … (cur-1) cur (cur+1) … last
const visiblePages = computed(() => {
  const total = totalPages.value
  const cur = page.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages = new Set([1, 2, total - 1, total, cur - 1, cur, cur + 1])
  const sorted = [...pages].filter(p => p >= 1 && p <= total).sort((a, b) => a - b)

  const result = []
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push('...')
    result.push(sorted[i])
  }
  return result
})

watch(filtered, () => { page.value = 1 })

function applyFilters({ city, maxPrice } = {}) {
  if (city !== undefined) filters.city = city
  if (maxPrice !== undefined) filters.maxPrice = maxPrice
}

function resetFilters() {
  filters.city = ''; filters.maxPrice = null; filters.sort = 'recent'; page.value = 1
}

onMounted(async () => {
  try {
    const { data } = await listingService.getAll({ limit: 1000 })
    allListings.value = data.listings ?? data
  } catch (e) {
    error.value = 'Impossible de charger les annonces. Vérifiez que l\'API est démarrée.'
  } finally { loading.value = false }
})
</script>

<style scoped>
@import "../assets/css/annonces.css";
</style>
