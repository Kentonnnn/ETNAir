<template>
  <div class="home">
    <!-- HERO ──────────────────────────────────────── -->
    <section class="hero">
      <div class="hero-slides">
        <div v-for="(slide, i) in slides" :key="i" :class="['hero-slide', { active: currentSlide === i }]"
             :style="{ backgroundImage: `url(${slide.img})` }">
        </div>
      </div>
      <div class="hero-overlay"></div>
      <div class="container hero-content">
        <div class="hero-badge">
          <span class="badge badge-accent">✈ Plateforme de location de logements</span>
        </div>
        <h1 class="hero-title">
          <LetterReveal text="Trouvez votre" :delay="200" /><br>
          <span class="hero-accent"><LetterReveal text="logement idéal" :delay="600" /></span>
        </h1>
        <p class="hero-subtitle" v-reveal="'up'" data-delay="800">Des logements meublés et équipés dans toute la France. Réservez en quelques clics.</p>
        <!-- Search bar -->
        <div v-reveal="'up'" data-delay="1000"><SearchBar @search="goSearch" /></div>
        <div class="hero-stats">
          <div class="stat float" v-for="s in stats" :key="s.label">
            <strong><CountUp :target="s.target" :suffix="s.suffix" /></strong>
            <span>{{ s.label }}</span>
          </div>
        </div>
      </div>
      <!-- Slide dots -->
      <div class="hero-dots">
        <button v-for="(_, i) in slides" :key="i" :class="['dot', { active: currentSlide === i }]" @click="currentSlide = i"></button>
      </div>
    </section>

    <!-- QUICK CATEGORIES ─────────────────────────── -->
    <section class="section categories-section">
      <div class="container">
        <div class="categories-grid">
          <div v-for="(cat, i) in categories" :key="cat.label"
            v-reveal="'scale'" :data-delay="i * 100">
            <RouterLink :to="`/annonces?city=${cat.city}`" class="cat-card">
              <div class="cat-img" :style="{ backgroundImage: `url(${cat.img})` }"></div>
              <div class="cat-body">
                <h3>{{ cat.label }}</h3>
                <span>{{ cat.count }}</span>
              </div>
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURED LISTINGS ────────────────────────── -->
    <section class="section listings-section">
      <div class="container">
        <div class="section-header-row">
          <div>
            <h2 class="section-title">Logements <span>à la une</span></h2>
            <p class="section-subtitle">Nos annonces les plus récentes</p>
          </div>
          <RouterLink to="/annonces" class="btn btn-outline">Tout voir →</RouterLink>
        </div>
        <div v-if="loadingListings" class="page-loader"><div class="spinner"></div></div>
        <div v-else-if="listings.length" class="grid-3">
          <ListingCard v-for="l in listings" :key="l.id" :listing="l" />
        </div>
        <div v-else class="empty-state">
          <div class="empty-icon">🏠</div>
          <p>Aucune annonce disponible pour l'instant.</p>
          <RouterLink to="/annonces/create" class="btn btn-primary" v-if="auth.isOwner">Publier une annonce</RouterLink>
        </div>
      </div>
    </section>

    <!-- REASSURANCE ──────────────────────────────── -->
    <section class="section reassurance-section" id="about">
      <div class="container">
        <div class="reassurance-grid">
          <div class="reassurance-img">
            <img src="https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=600&h=500&fit=crop" alt="Confort" />
            <div class="reassurance-badge">
              <strong>+35</strong>
              <span>ans d'expérience</span>
            </div>
          </div>
          <div class="reassurance-content">
            <p class="section-badge">Pourquoi ETNAir ?</p>
            <h2 class="section-title">Un logement moderne<br>sans renoncer au <span>confort</span></h2>
            <div class="perks">
              <div class="perk" v-for="p in perks" :key="p.title">
                <div class="perk-icon">{{ p.icon }}</div>
                <div>
                  <h4>{{ p.title }}</h4>
                  <p>{{ p.desc }}</p>
                </div>
              </div>
            </div>
            <RouterLink to="/register" class="btn btn-primary btn-lg">Créer mon compte →</RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURES STRIP ───────────────────────────── -->
    <section class="features-strip">
      <div class="container">
        <div class="features-grid">
          <div class="feature" v-for="f in features" :key="f.label">
            <span class="feature-icon">{{ f.icon }}</span>
            <span>{{ f.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA BANNER ───────────────────────────────── -->
    <section class="cta-banner">
      <div class="container cta-inner">
        <div>
          <h2>Vous êtes propriétaire ?</h2>
          <p>Publiez gratuitement vos annonces et touchez des milliers de personnes.</p>
        </div>
        <div class="cta-actions">
          <RouterLink to="/register" class="btn btn-white btn-lg">Déposer une annonce</RouterLink>
          <RouterLink to="/annonces" class="btn btn-outline-white btn-lg">Voir les annonces</RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { listingService } from '@/services/api'
import SearchBar from '@/components/SearchBar.vue'
import ListingCard from '@/components/ListingCard.vue'
import LetterReveal from '@/components/LetterReveal.vue'
import CountUp from '@/components/CountUp.vue'

const router = useRouter()
const auth = useAuthStore()
const listings = ref([])
const loadingListings = ref(true)
const currentSlide = ref(0)
let slideTimer = null

const slides = [
  { img: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1400&h=700&fit=crop' },
  { img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1400&h=700&fit=crop' },
  { img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1400&h=700&fit=crop' },
]

const stats = [
  { target: 500, suffix: '+', label: 'Logements disponibles' },
  { target: 50,  suffix: '+', label: 'Villes en France' },
  { target: 10000, suffix: '+', label: 'Utilisateurs satisfaits' },
]

const categories = [
  { label: 'Paris', city: 'Paris', count: 'Île-de-France', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=300&h=200&fit=crop' },
  { label: 'Lyon', city: 'Lyon', count: 'Auvergne-Rhône-Alpes', img: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=300&h=200&fit=crop' },
  { label: 'Toulouse', city: 'Toulouse', count: 'Occitanie', img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop' },
  { label: 'Bordeaux', city: 'Bordeaux', count: 'Nouvelle-Aquitaine', img: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300&h=200&fit=crop' },
]


const perks = [
  { icon: '🔒', title: 'Logements 100% sécurisés', desc: 'Tous nos logements sont vérifiés et les propriétaires validés.' },
  { icon: '⚡', title: 'Réservation ultra-rapide', desc: 'Moins de 5 minutes pour soumettre votre demande.' },
  { icon: '🤝', title: 'Communauté dynamique', desc: 'Rejoignez des milliers d\'utilisateurs partout en France.' },
]

const features = [
  { icon: '📶', label: 'Wi-Fi inclus' },
  { icon: '🛋️', label: 'Meublé' },
  { icon: '🏊', label: 'Espaces communs' },
  { icon: '🚉', label: 'Bien desservi' },
  { icon: '🔐', label: 'Sécurisé 24h/24' },
  { icon: '📦', label: 'Charges comprises' },
]

function goSearch({ city, maxPrice }) {
  const q = new URLSearchParams()
  if (city) q.set('city', city)
  if (maxPrice) q.set('maxPrice', maxPrice)
  router.push(`/annonces?${q.toString()}`)
}

onMounted(async () => {
  try {
    const { data } = await listingService.getAll({ limit: 6 })
    listings.value = (data.listings ?? data).slice(0, 6)
  } catch { /* API non dispo */ }
  finally { loadingListings.value = false }

  slideTimer = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % slides.length
  }, 5000)
})

onUnmounted(() => clearInterval(slideTimer))
</script>

<style scoped>
@import "../assets/css/home.css";
</style>
