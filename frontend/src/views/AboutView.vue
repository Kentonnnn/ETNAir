<template>
  <div class="about-page">
    <!-- Hero with quote + image -->
    <section class="about-hero">
      <div class="container">
        <div class="hero-grid">
          <div class="quote-block" v-reveal="'left'">
            <span class="quote-mark">"</span>
            <blockquote>
              Notre travail n'a de sens que s'il est un témoignage fidèle de son temps.
            </blockquote>
            <p class="quote-author">— Équipe ETNAir, Fondateurs</p>
            <span class="quote-mark closing">"</span>
          </div>
          <div class="hero-img-block" v-reveal="'right'">
            <div class="team-photo large">
              <img src="/Groupepic.jpg" alt="L'équipe ETNAir" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Team -->
    <section class="team-section">
      <div class="container">
        <div class="team-grid">
          <div class="team-portraits" v-reveal="'up'">
            <a
              v-for="(m, i) in team" :key="m.name"
              :href="m.linkedin" target="_blank" rel="noopener noreferrer"
              class="portrait"
              :data-delay="i * 80"
              :title="`Voir le profil LinkedIn de ${m.name}`"
            >
              <div class="portrait-img">
                <img v-if="m.photo" :src="m.photo" :alt="m.name" />
                <span v-else>{{ m.initials }}</span>
                <div class="portrait-overlay">
                  <span class="li-icon">in</span>
                </div>
              </div>
              <div class="portrait-info">
                <strong>{{ m.name }}</strong>
                <span>{{ m.role }}</span>
              </div>
            </a>
          </div>

          <div class="team-content" v-reveal="'right'">
            <h2 class="team-title">L'ÉQUIPE.</h2>
            <p class="team-text">
              Toute création n'a de valeur que par le regard qu'on lui porte.
              Une plateforme ne se résume pas à des lignes de code — c'est un dialogue,
              une promesse, un engagement envers ceux qui l'utilisent.
            </p>
            <p class="team-text">
              Nous avons construit ETNAir avec l'idée que chacun méritait
              autant d'attention qu'un client haut de gamme. Que la simplicité
              n'était pas l'opposé de l'exigence, mais sa forme la plus aboutie.
            </p>
          </div>
        </div>

        <!-- Stats row -->
        <div class="stats-row" v-reveal="'up'">
          <div class="stat-item" v-for="s in stats" :key="s.label">
            <div class="stat-value">
              <CountUp :target="s.target" :suffix="s.suffix || ''" />
            </div>
            <div class="stat-label">{{ s.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Mission -->
    <section class="mission-section">
      <div class="container">
        <div class="mission-grid">
          <div v-reveal="'left'">
            <p class="section-badge">Notre mission</p>
            <h2 class="mission-title">
              Rendre le logement <span class="gradient-text">simple, juste, accessible.</span>
            </h2>
          </div>
          <div class="mission-values">
            <div class="value-item" v-for="(v, i) in values" :key="v.title"
              v-reveal="'up'" :data-delay="i * 100">
              <span class="value-icon">{{ v.icon }}</span>
              <h4>{{ v.title }}</h4>
              <p>{{ v.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="about-cta">
      <div class="container">
        <h2 v-reveal="'up'">Rejoignez l'aventure</h2>
        <p v-reveal="'up'" data-delay="100">
          Plus de 10 000 utilisateurs nous font déjà confiance pour leur logement.
        </p>
        <div class="cta-btns" v-reveal="'up'" data-delay="200">
          <RouterLink to="/register" class="btn btn-primary btn-lg">Créer un compte</RouterLink>
          <RouterLink to="/annonces" class="btn btn-outline btn-lg">Voir les logements</RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import CountUp from '@/components/CountUp.vue'

const team = [
  { name: 'Harvey M.',    role: 'Co-fondateur · Lead Dev',  initials: 'HM', photo: '/WhatsApp Image 2026-05-31 at 15.08.01.jpeg', linkedin: 'https://www.linkedin.com/in/harvey-mouloundou/' },
  { name: 'Nelson P.',    role: 'Co-fondateur · Produit',   initials: 'NP', photo: '/nel.jpg',         linkedin: 'https://www.linkedin.com/in/nelson-pires-da-silva/' },
  { name: 'Alexandre C.', role: 'Designer · UX/UI',         initials: 'AC', photo: '/alexandre2.jpeg', linkedin: 'https://www.linkedin.com/in/alexandre-chikhaoui-a577923aa/' },
  { name: 'Yamine I.',    role: 'Ingénieur · Backend',      initials: 'YI', photo: '/yamine.jpeg',     linkedin: 'https://www.linkedin.com/in/yamine-ikhlef/' },
]

const stats = [
  { target: 600,   suffix: '+', label: 'Logements référencés sur la plateforme' },
  { target: 10000, suffix: '+', label: 'Utilisateurs satisfaits depuis le lancement' },
  { target: 50,    suffix: '+', label: 'Villes couvertes en France' },
  { target: 98,    suffix: '%', label: 'Taux de satisfaction propriétaire' },
]

const values = [
  { icon: '◆', title: 'Transparence',   desc: 'Aucun frais caché, aucune commission. Les prix affichés sont les prix réels.' },
  { icon: '◇', title: 'Confiance',      desc: 'Chaque annonce est vérifiée, chaque propriétaire est validé avant publication.' },
  { icon: '◈', title: 'Engagement',     desc: 'Une équipe disponible et un support réactif pour répondre à vos questions.' },
  { icon: '◉', title: 'Innovation',     desc: 'Une plateforme moderne pensée pour tous les profils.' },
]
</script>

<style scoped>
@import "../assets/css/about.css";
</style>
