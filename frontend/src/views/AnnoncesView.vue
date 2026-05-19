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
            <input v-model.number="filters.maxPrice" type="number" class="form-input" placeholder="Illimité" @input="applyFilters(filters)" />
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
            <button :class="['view-btn', { active: viewMode === 'grid' }]" @click="viewMode = 'grid'">⊞</button>
            <button :class="['view-btn', { active: viewMode === 'list' }]" @click="viewMode = 'list'">☰</button>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="page-loader"><div class="spinner"></div></div>

        <!-- Error -->
        <div v-else-if="error" class="alert alert-error">{{ error }}</div>

        <!-- Empty -->
        <div v-else-if="filtered.length === 0" class="empty">
          <div style="font-size:4rem;margin-bottom:16px;">🔍</div>
          <h3>Aucun logement trouvé</h3>
          <p>Essayez de modifier vos critères de recherche</p>
          <button class="btn btn-outline" @click="resetFilters">Réinitialiser les filtres</button>
        </div>

        <!-- Grid / List -->
        <div v-else :class="viewMode === 'grid' ? 'grid-3' : 'list-view'">
          <ListingCard v-for="l in paginated" :key="l.id" :listing="l" />
        </div>

        <!-- Pagination -->
        <div class="pagination" v-if="totalPages > 1">
          <button class="page-btn" :disabled="page <= 1" @click="page--">← Précédent</button>
          <div class="page-nums">
            <button v-for="p in totalPages" :key="p" :class="['page-num', { active: page === p }]" @click="page = p">{{ p }}</button>
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
    const { data } = await listingService.getAll()
    allListings.value = data.listings ?? data
  } catch (e) {
    error.value = 'Impossible de charger les annonces. Vérifiez que l\'API est démarrée.'
  } finally { loading.value = false }
})
</script>

<style scoped>
.page-header { background: linear-gradient(135deg, var(--primary-dark), var(--primary)); color: #fff; padding: 60px 0 80px; }
.page-header h1 { font-size: 2.5rem; font-weight: 800; margin-bottom: 8px; }
.page-header h1 span { color: var(--accent); }
.page-header p { opacity: .85; margin-bottom: 32px; font-size: 1rem; }
.page-body { display: grid; grid-template-columns: 260px 1fr; gap: 32px; margin-top: -40px; padding-bottom: 60px; align-items: start; }
.filters { position: sticky; top: calc(var(--nav-h) + 20px); }
.filter-panel { background: var(--white); border-radius: var(--radius); border: 1px solid var(--border); padding: 24px; box-shadow: var(--shadow-sm); margin-bottom: 20px; }
.filter-title { font-size: 1rem; font-weight: 700; color: var(--text); margin-bottom: 20px; }
.filter-group { margin-bottom: 20px; }
.filter-label { display: block; font-size: .85rem; font-weight: 600; color: var(--text); margin-bottom: 8px; }
select.form-input { cursor: pointer; }
.owner-cta { background: var(--primary-light); border: 1px solid var(--primary); border-radius: var(--radius); padding: 20px; text-align: center; }
.owner-cta-icon { font-size: 2rem; display: block; margin-bottom: 8px; }
.owner-cta h4 { font-weight: 700; color: var(--primary); margin-bottom: 4px; font-size: .95rem; }
.owner-cta p { font-size: .85rem; color: var(--text-muted); margin-bottom: 16px; }
.results-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.results-count { font-size: .95rem; color: var(--text-muted); }
.results-count strong { color: var(--text); font-weight: 700; }
.view-toggle { display: flex; gap: 4px; }
.view-btn { width: 36px; height: 36px; border-radius: 8px; border: 1px solid var(--border); background: var(--white); cursor: pointer; font-size: 1rem; transition: all var(--transition); }
.view-btn.active { background: var(--primary); color: #fff; border-color: var(--primary); }
.list-view { display: flex; flex-direction: column; gap: 16px; }
.empty { text-align: center; padding: 80px 0; }
.empty h3 { font-size: 1.2rem; font-weight: 700; margin-bottom: 8px; }
.empty p { color: var(--text-muted); margin-bottom: 24px; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 12px; margin-top: 48px; }
.page-btn { padding: 10px 20px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--white); cursor: pointer; font-family: var(--font); font-size: .9rem; transition: all var(--transition); }
.page-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
.page-btn:disabled { opacity: .4; cursor: not-allowed; }
.page-nums { display: flex; gap: 4px; }
.page-num { width: 36px; height: 36px; border-radius: 8px; border: 1px solid var(--border); background: var(--white); cursor: pointer; font-size: .9rem; transition: all var(--transition); }
.page-num.active { background: var(--primary); color: #fff; border-color: var(--primary); }
@media (max-width: 900px) { .page-body { grid-template-columns: 1fr; } .filters { position: static; } }
</style>