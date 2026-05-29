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
          <span class="badge badge-accent">✈ Plateforme de location étudiante</span>
        </div>
        <h1 class="hero-title">
          Trouvez votre<br><span>logement idéal</span>
        </h1>
        <p class="hero-subtitle">Des logements meublés et équipés dans toute la France. Réservez en quelques clics.</p>
        <!-- Search bar -->
        <SearchBar @search="goSearch" />
        <div class="hero-stats">
          <div class="stat" v-for="s in stats" :key="s.label">
            <strong>{{ s.value }}</strong>
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
          <RouterLink v-for="cat in categories" :key="cat.label"
            :to="`/annonces?city=${cat.city}`" class="cat-card">
            <div class="cat-img" :style="{ backgroundImage: `url(${cat.img})` }"></div>
            <div class="cat-body">
              <h3>{{ cat.label }}</h3>
              <span>{{ cat.count }}</span>
            </div>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS ─────────────────────────────── -->
    <section class="section how-section" id="how">
      <div class="container">
        <p class="section-badge">Simple & rapide</p>
        <h2 class="section-title">Comment <span>réserver</span> mon logement ?</h2>
        <p class="section-subtitle">4 étapes simples pour trouver votre logement idéal</p>
        <div class="steps-grid">
          <div class="step-card" v-for="(step, i) in steps" :key="i">
            <div class="step-icon">{{ step.icon }}</div>
            <div class="step-num">{{ i + 1 }}</div>
            <h3>{{ step.title }}</h3>
            <p>{{ step.desc }}</p>
          </div>
        </div>
        <div style="text-align:center;margin-top:40px">
          <RouterLink to="/annonces" class="btn btn-primary btn-lg">
            Voir les logements →
          </RouterLink>
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
            <h2 class="section-title">Une résidence étudiante<br>sans renoncer au <span>confort</span></h2>
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
          <p>Publiez gratuitement vos annonces et touchez des milliers d'étudiants.</p>
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
  { value: '500+', label: 'Logements disponibles' },
  { value: '50+', label: 'Villes en France' },
  { value: '10 000+', label: 'Étudiants satisfaits' },
]

const categories = [
  { label: 'Paris', city: 'Paris', count: 'Île-de-France', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=300&h=200&fit=crop' },
  { label: 'Lyon', city: 'Lyon', count: 'Auvergne-Rhône-Alpes', img: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=300&h=200&fit=crop' },
  { label: 'Toulouse', city: 'Toulouse', count: 'Occitanie', img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop' },
  { label: 'Bordeaux', city: 'Bordeaux', count: 'Nouvelle-Aquitaine', img: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300&h=200&fit=crop' },
]

const steps = [
  { icon: '🏠', title: 'Choisissez votre logement', desc: 'Parcourez nos annonces et trouvez le logement qui correspond à vos critères.' },
  { icon: '📱', title: 'Faites votre demande', desc: 'Créez un compte et soumettez votre demande en quelques clics.' },
  { icon: '📄', title: 'Envoyez vos justificatifs', desc: 'Téléchargez vos documents directement depuis votre espace personnel.' },
  { icon: '🔑', title: 'Bienvenue chez vous !', desc: 'Emménagez et profitez de votre nouveau logement étudiant.' },
]

const perks = [
  { icon: '🔒', title: 'Logements 100% sécurisés', desc: 'Tous nos logements sont vérifiés et les propriétaires validés.' },
  { icon: '⚡', title: 'Réservation ultra-rapide', desc: 'Moins de 5 minutes pour soumettre votre demande.' },
  { icon: '🤝', title: 'Communauté étudiante', desc: 'Rejoignez des milliers d\'étudiants dans toute la France.' },
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
    const { data } = await listingService.getAll()
    listings.value = data.slice(0, 6)
  } catch { /* API non dispo */ }
  finally { loadingListings.value = false }

  slideTimer = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % slides.length
  }, 5000)
})

onUnmounted(() => clearInterval(slideTimer))
</script>

<style scoped>
/* HERO */
.hero { position: relative; height: 600px; display: flex; align-items: center; overflow: hidden; }
.hero-slides { position: absolute; inset: 0; }
.hero-slide { position: absolute; inset: 0; background-size: cover; background-position: center; opacity: 0; transition: opacity 1s ease; }
.hero-slide.active { opacity: 1; }
.hero-overlay { position: absolute; inset: 0; background: linear-gradient(to right, rgba(4,88,160,.85) 40%, rgba(4,88,160,.4)); }
.hero-content { position: relative; z-index: 1; color: #fff; }
.hero-badge { margin-bottom: 20px; }
.hero-title { font-size: clamp(2.2rem, 5vw, 3.5rem); font-weight: 800; line-height: 1.15; margin-bottom: 16px; }
.hero-title span { color: var(--accent); }
.hero-subtitle { font-size: 1.1rem; opacity: .9; margin-bottom: 32px; max-width: 500px; }
.hero-stats { display: flex; gap: 40px; margin-top: 32px; }
.stat { display: flex; flex-direction: column; }
.stat strong { font-size: 1.8rem; font-weight: 800; color: var(--accent); }
.stat span { font-size: .85rem; opacity: .8; }
.hero-dots { position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; z-index: 2; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,.4); border: none; cursor: pointer; transition: all .3s; }
.dot.active { background: #fff; width: 24px; border-radius: 4px; }

/* CATEGORIES */
.categories-section { padding: 40px 0; }
.categories-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.cat-card { border-radius: var(--radius); overflow: hidden; position: relative; height: 160px; display: flex; flex-direction: column; justify-content: flex-end; cursor: pointer; text-decoration: none; }
.cat-img { position: absolute; inset: 0; background-size: cover; background-position: center; transition: transform .4s ease; }
.cat-card:hover .cat-img { transform: scale(1.06); }
.cat-card::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.7) 40%, transparent); }
.cat-body { position: relative; z-index: 1; padding: 16px; color: #fff; }
.cat-body h3 { font-size: 1.05rem; font-weight: 700; margin-bottom: 2px; }
.cat-body span { font-size: .78rem; opacity: .8; }

/* HOW */
.how-section { background: var(--bg); }
.section-badge { color: var(--primary); font-weight: 700; font-size: .85rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
.section-header-row { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 48px; }
.steps-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
.step-card { background: var(--white); border-radius: var(--radius); padding: 32px 24px; text-align: center; position: relative; border: 1px solid var(--border); transition: all var(--transition); }
.step-card:hover { box-shadow: var(--shadow); transform: translateY(-4px); }
.step-icon { font-size: 2.5rem; margin-bottom: 12px; }
.step-num { position: absolute; top: 16px; right: 16px; width: 28px; height: 28px; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: .8rem; font-weight: 700; }
.step-card h3 { font-size: 1rem; font-weight: 700; margin-bottom: 8px; color: var(--text); }
.step-card p { font-size: .85rem; color: var(--text-muted); line-height: 1.6; }

/* LISTINGS */
.listings-section { background: var(--white); }
.empty-state { text-align: center; padding: 60px 0; }
.empty-icon { font-size: 4rem; margin-bottom: 16px; }
.empty-state p { color: var(--text-muted); margin-bottom: 24px; }

/* REASSURANCE */
.reassurance-section { background: var(--bg); }
.reassurance-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
.reassurance-img { position: relative; }
.reassurance-img img { border-radius: var(--radius); width: 100%; height: 480px; object-fit: cover; }
.reassurance-badge { position: absolute; bottom: -20px; right: -20px; background: var(--primary); color: #fff; border-radius: var(--radius); padding: 20px 28px; text-align: center; box-shadow: var(--shadow-lg); }
.reassurance-badge strong { display: block; font-size: 2rem; font-weight: 800; }
.reassurance-badge span { font-size: .85rem; opacity: .9; }
.perks { display: flex; flex-direction: column; gap: 20px; margin: 32px 0; }
.perk { display: flex; gap: 16px; align-items: flex-start; }
.perk-icon { font-size: 1.5rem; flex-shrink: 0; width: 44px; height: 44px; background: var(--primary-light); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; }
.perk h4 { font-size: 1rem; font-weight: 700; color: var(--text); margin-bottom: 4px; }
.perk p { font-size: .875rem; color: var(--text-muted); }

/* FEATURES STRIP */
.features-strip { background: var(--primary); padding: 24px 0; }
.features-grid { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
.feature { display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,.9); font-size: .9rem; font-weight: 500; }
.feature-icon { font-size: 1.2rem; }

/* CTA BANNER */
.cta-banner { background: linear-gradient(135deg, #0f172a 0%, var(--primary-dark) 100%); padding: 80px 0; color: #fff; }
.cta-inner { display: flex; justify-content: space-between; align-items: center; gap: 40px; }
.cta-inner h2 { font-size: 2rem; font-weight: 800; margin-bottom: 8px; }
.cta-inner p { opacity: .8; }
.cta-actions { display: flex; gap: 16px; flex-shrink: 0; }
.btn-outline-white { background: transparent; color: #fff; border: 2px solid rgba(255,255,255,.5); }
.btn-outline-white:hover { border-color: #fff; background: rgba(255,255,255,.1); }

@media (max-width: 900px) {
  .hero { height: 500px; }
  .categories-grid { grid-template-columns: repeat(2, 1fr); }
  .steps-grid { grid-template-columns: repeat(2, 1fr); }
  .reassurance-grid { grid-template-columns: 1fr; gap: 40px; }
  .reassurance-img { display: none; }
  .cta-inner { flex-direction: column; text-align: center; }
  .features-grid { justify-content: center; }
}
@media (max-width: 600px) {
  .hero-stats { flex-direction: column; gap: 12px; }
  .categories-grid, .steps-grid { grid-template-columns: 1fr; }
  .cta-actions { flex-direction: column; width: 100%; }
  .section-header-row { flex-direction: column; align-items: flex-start; gap: 16px; }
}
</style>