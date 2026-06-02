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
@import "../assets/css/favorites.css";
</style>
