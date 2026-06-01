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
            <div class="img-placeholder large">
              <span>Photo équipe au travail</span>
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
            <div class="portrait" v-for="(m, i) in team" :key="m.name" :data-delay="i * 80">
              <div class="img-placeholder portrait-img">
                <span>{{ m.initials }}</span>
              </div>
              <div class="portrait-info">
                <strong>{{ m.name }}</strong>
                <span>{{ m.role }}</span>
              </div>
            </div>
          </div>

          <div class="team-content" v-reveal="'right'">
            <h2 class="team-title">L'ÉQUIPE.</h2>
            <p class="team-text">
              Toute création n'a de valeur que par le regard qu'on lui porte.
              Une plateforme ne se résume pas à des lignes de code — c'est un dialogue,
              une promesse, un engagement envers ceux qui l'utilisent.
            </p>
            <p class="team-text">
              Nous avons construit ETNAir avec l'idée qu'un étudiant méritait
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
              Rendre le logement étudiant <span class="gradient-text">simple, juste, accessible.</span>
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
          Plus de 10 000 étudiants nous font déjà confiance pour leur logement.
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
  { name: 'Harvey M.',    role: 'Co-fondateur · Lead Dev',   initials: 'HM' },
  { name: 'Kenton N.',    role: 'Co-fondateur · Produit',    initials: 'KN' },
  { name: 'Marie D.',     role: 'Designer · UX/UI',          initials: 'MD' },
  { name: 'Paul L.',      role: 'Ingénieur · Backend',       initials: 'PL' },
]

const stats = [
  { target: 600,   suffix: '+', label: 'Logements référencés sur la plateforme' },
  { target: 10000, suffix: '+', label: 'Étudiants satisfaits depuis le lancement' },
  { target: 50,    suffix: '+', label: 'Villes couvertes en France' },
  { target: 98,    suffix: '%', label: 'Taux de satisfaction propriétaire' },
]

const values = [
  { icon: '◆', title: 'Transparence',   desc: 'Aucun frais caché, aucune commission étudiante. Les prix affichés sont les prix réels.' },
  { icon: '◇', title: 'Confiance',      desc: 'Chaque annonce est vérifiée, chaque propriétaire est validé avant publication.' },
  { icon: '◈', title: 'Engagement',     desc: 'Une équipe disponible et un support réactif pour répondre à vos questions.' },
  { icon: '◉', title: 'Innovation',     desc: 'Une plateforme moderne pensée pour la nouvelle génération d\'étudiants.' },
]
</script>

<style scoped>
.about-page { background: var(--bg); min-height: 100vh; }

/* ── Hero ────────────────────────────────────────── */
.about-hero { padding: 100px 0 80px; }
.hero-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 64px; align-items: center; }

.quote-block { position: relative; padding: 24px 0; }
.quote-mark {
  font-family: Georgia, serif;
  font-size: 4rem;
  font-weight: 700;
  color: var(--text);
  line-height: 1;
  display: block;
}
.quote-mark.closing {
  text-align: right;
  margin-top: 12px;
}
blockquote {
  font-family: Georgia, serif;
  font-style: italic;
  font-size: clamp(1.3rem, 2.4vw, 1.9rem);
  line-height: 1.4;
  color: var(--text);
  margin: 8px 0 20px;
  max-width: 420px;
}
.quote-author {
  font-size: .85rem;
  color: var(--text-muted);
  font-weight: 500;
  letter-spacing: .5px;
}

.hero-img-block { display: flex; justify-content: flex-end; }

/* ── Image placeholders (no real photos needed) ──── */
.img-placeholder {
  background: linear-gradient(135deg, #d4d4d8, #a1a1aa);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,.85);
  font-weight: 500;
  font-size: .85rem;
  letter-spacing: .5px;
  text-transform: uppercase;
  position: relative;
  overflow: hidden;
}
.img-placeholder::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(45deg, rgba(255,255,255,.06) 0 10px, transparent 10px 20px);
}
.img-placeholder span { position: relative; z-index: 1; }

.img-placeholder.large {
  width: 100%;
  max-width: 500px;
  aspect-ratio: 4 / 3;
  border-radius: 4px;
}

[data-theme="dark"] .img-placeholder {
  background: linear-gradient(135deg, #2a2a2a, #1a1a1a);
}

/* ── Team section ────────────────────────────────── */
.team-section { padding: 100px 0; }
.team-grid {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 80px;
  align-items: center;
  margin-bottom: 100px;
}

.team-portraits {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.portrait { display: flex; flex-direction: column; gap: 8px; }
.portrait-img {
  aspect-ratio: 1 / 1;
  width: 100%;
  border-radius: 2px;
  font-size: 1.5rem;
  font-weight: 700;
  color: rgba(255,255,255,.7);
}
.portrait-info {
  display: flex;
  flex-direction: column;
  font-size: .8rem;
  padding: 4px 2px;
}
.portrait-info strong { color: var(--text); font-weight: 600; margin-bottom: 2px; }
.portrait-info span { color: var(--text-muted); font-size: .75rem; }

.team-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 900;
  letter-spacing: -0.02em;
  margin-bottom: 32px;
  color: var(--text);
}
.team-text {
  font-size: .95rem;
  color: var(--text-muted);
  line-height: 1.8;
  margin-bottom: 16px;
  max-width: 480px;
}

/* ── Stats row ───────────────────────────────────── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
  padding: 48px 0;
  border-top: 1px solid var(--border);
}
.stat-value {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  color: var(--text);
  line-height: 1;
  margin-bottom: 8px;
}
.stat-label {
  font-size: .8rem;
  color: var(--text-muted);
  line-height: 1.5;
  max-width: 180px;
}

/* ── Mission ─────────────────────────────────────── */
.mission-section { padding: 100px 0; background: var(--white); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
.mission-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; }
.section-badge {
  color: var(--primary);
  font-weight: 700;
  font-size: .75rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 16px;
}
.mission-title {
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  font-weight: 800;
  line-height: 1.2;
  color: var(--text);
}

.mission-values {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}
.value-item { padding: 20px 0; }
.value-icon { font-size: 1.4rem; color: var(--primary); margin-bottom: 12px; display: block; }
.value-item h4 { font-size: 1rem; font-weight: 700; color: var(--text); margin-bottom: 8px; }
.value-item p { font-size: .85rem; color: var(--text-muted); line-height: 1.6; }

/* ── CTA ─────────────────────────────────────────── */
.about-cta { padding: 100px 0; text-align: center; }
.about-cta h2 {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  color: var(--text);
  margin-bottom: 16px;
}
.about-cta p {
  color: var(--text-muted);
  font-size: 1.05rem;
  margin-bottom: 40px;
  max-width: 540px;
  margin-left: auto;
  margin-right: auto;
}
.cta-btns { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }

@media (max-width: 900px) {
  .hero-grid, .team-grid, .mission-grid { grid-template-columns: 1fr; gap: 48px; }
  .stats-row { grid-template-columns: repeat(2, 1fr); gap: 32px; }
  .img-placeholder.large { max-width: 100%; }
}
@media (max-width: 600px) {
  .team-portraits, .mission-values { grid-template-columns: 1fr 1fr; }
  .stats-row { grid-template-columns: 1fr; }
  .cta-btns { flex-direction: column; }
}
</style>
