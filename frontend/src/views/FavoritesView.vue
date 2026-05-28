<template>
  <div class="fav-page">
    <div class="fav-header">
      <div class="container">
        <RouterLink to="/annonces" class="back-link">← Tous les logements</RouterLink>
        <h1>Mes <span>favoris</span></h1>
        <p>{{ listings.length }} annonce{{ listings.length !== 1 ? 's' : '' }} sauvegardée{{ listings.length !== 1 ? 's' : '' }}</p>
      </div>
    </div>

    <div class="container fav-body">
      <div v-if="loading" class="page-loader"><div class="spinner"></div></div>

      <div v-else-if="listings.length === 0" class="empty-state">
        <div class="empty-icon">♡</div>
        <h3>Aucun favori pour l'instant</h3>
        <p>Cliquez sur le cœur d'une annonce pour l'ajouter ici.</p>
        <RouterLink to="/annonces" class="btn btn-primary">Explorer les logements</RouterLink>
      </div>

      <div v-else class="listings-grid">
        <ListingCard v-for="l in listings" :key="l.id" :listing="l" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useFavoritesStore } from '@/stores/favorites'
import { favoriteService } from '@/services/api'
import ListingCard from '@/components/ListingCard.vue'

const favStore = useFavoritesStore()
const listings = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    if (!favStore.loaded) await favStore.load()
    const { data } = await favoriteService.getAll()
    listings.value = data.listings
  } catch {}
  finally { loading.value = false }
})
</script>

<style scoped>
.fav-header { background: linear-gradient(135deg, #e74c3c, #c0392b); color: #fff; padding: 48px 0; }
.back-link { display: inline-block; color: rgba(255,255,255,.7); font-size: .85rem; margin-bottom: 16px; transition: color var(--transition); }
.back-link:hover { color: #fff; }
.fav-header h1 { font-size: 2rem; font-weight: 800; margin-bottom: 4px; }
.fav-header h1 span { color: #ffd6d6; }
.fav-header p { opacity: .8; }
.fav-body { padding: 48px 24px 80px; }
.empty-state { text-align: center; padding: 80px 0; }
.empty-icon { font-size: 5rem; margin-bottom: 16px; color: #e74c3c; line-height: 1; }
.empty-state h3 { font-size: 1.3rem; font-weight: 700; margin-bottom: 8px; }
.empty-state p { color: var(--text-muted); margin-bottom: 24px; }
.listings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
</style>
