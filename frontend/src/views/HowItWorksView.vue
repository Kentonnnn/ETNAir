<template>
  <div class="how-page">
    <!-- Header -->
    <div class="how-header">
      <div class="container">
        <p class="section-badge" v-reveal="'up'">Simple & rapide</p>
        <h1 v-reveal="'up'" data-delay="100">
          Comment <span>réserver</span> mon logement ?
        </h1>
        <p class="how-subtitle" v-reveal="'up'" data-delay="200">
          De la recherche aux clés, tout se passe en 4 étapes simples.
        </p>
      </div>
    </div>

    <!-- Steps -->
    <div class="container how-body">
      <div class="steps-grid">
        <div class="step-card" v-for="(step, i) in steps" :key="i"
          v-reveal="'up'" :data-delay="i * 120">
          <div class="step-icon">{{ step.icon }}</div>
          <div class="step-num">{{ i + 1 }}</div>
          <h3>{{ step.title }}</h3>
          <p>{{ step.desc }}</p>
        </div>
      </div>

      <!-- FAQ teaser -->
      <div class="faq-section" v-reveal="'up'" data-delay="100">
        <h2 class="section-title">Questions fréquentes</h2>
        <div class="faq-list">
          <div class="faq-item" v-for="q in faq" :key="q.q" @click="q.open = !q.open">
            <div class="faq-q">
              <span>{{ q.q }}</span>
              <span class="faq-icon">{{ q.open ? '−' : '+' }}</span>
            </div>
            <div class="faq-a" v-if="q.open">{{ q.a }}</div>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="how-cta" v-reveal="'scale'" data-delay="200">
        <h2>Prêt à trouver votre logement ?</h2>
        <p>Plus de 500 logements étudiants disponibles partout en France.</p>
        <div class="cta-btns">
          <RouterLink to="/annonces" class="btn btn-primary btn-lg">Voir les logements →</RouterLink>
          <RouterLink to="/register" class="btn btn-outline btn-lg">Créer un compte</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const steps = [
  { icon: '🏠', title: 'Choisissez votre logement', desc: 'Parcourez nos annonces et trouvez le logement qui correspond à vos critères grâce aux filtres de recherche et à la carte interactive.' },
  { icon: '📱', title: 'Faites votre demande', desc: 'Créez un compte en quelques secondes et soumettez votre demande directement depuis la fiche du logement.' },
  { icon: '📄', title: 'Envoyez vos justificatifs', desc: 'Téléchargez vos documents (pièce d\'identité, justificatif de scolarité, garant) directement depuis votre espace personnel.' },
  { icon: '🔑', title: 'Bienvenue chez vous !', desc: 'Une fois votre dossier accepté, coordinatez votre arrivée avec le propriétaire et emménagez dans votre nouveau logement étudiant.' },
]

const faq = reactive([
  { q: 'Combien de temps prend le traitement d\'un dossier ?', a: 'En général, les propriétaires répondent sous 48 à 72 heures. Vous recevrez une notification dès qu\'une décision est prise.', open: false },
  { q: 'Quels documents sont nécessaires ?', a: 'Une pièce d\'identité valide, un justificatif de scolarité, et un garant (parents ou organisme de cautionnement). Certains propriétaires peuvent demander des justificatifs supplémentaires.', open: false },
  { q: 'La plateforme est-elle gratuite pour les étudiants ?', a: 'Oui, ETNAir est entièrement gratuit pour les étudiants. Aucun frais de dossier ni commission n\'est prélevé.', open: false },
  { q: 'Comment contacter le propriétaire ?', a: 'Les coordonnées du propriétaire sont visibles sur chaque fiche annonce. Vous pouvez également envoyer un message directement depuis la plateforme.', open: false },
])
</script>

<style scoped>
.how-page { background: var(--bg); min-height: 100vh; }

.how-header { background: linear-gradient(135deg, #034080, #0458a0); color: #fff; padding: 72px 0 80px; }
.how-header .section-badge { color: rgba(255,255,255,.7); font-size: .8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px; }
.how-header h1 { font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; line-height: 1.2; margin-bottom: 16px; }
.how-header h1 span { color: var(--accent); }
.how-subtitle { opacity: .85; font-size: 1.1rem; max-width: 540px; }

.how-body { padding: 64px 24px 80px; }

/* Steps */
.steps-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-bottom: 80px; }
.step-card { background: var(--white); border-radius: var(--radius); padding: 36px 24px; text-align: center; position: relative; border: 1px solid var(--border); transition: all .3s cubic-bezier(.4,0,.2,1); }
.step-card:hover { box-shadow: var(--shadow); transform: translateY(-6px); }
.step-icon { font-size: 3rem; margin-bottom: 16px; }
.step-num { position: absolute; top: 16px; right: 16px; width: 30px; height: 30px; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: .85rem; font-weight: 700; }
.step-card h3 { font-size: 1rem; font-weight: 700; margin-bottom: 10px; color: var(--text); }
.step-card p { font-size: .88rem; color: var(--text-muted); line-height: 1.7; }

/* Connector line between steps */
.steps-grid { position: relative; }
.step-card::after { content: '→'; position: absolute; right: -20px; top: 50%; transform: translateY(-50%); font-size: 1.2rem; color: var(--border); z-index: 2; }
.step-card:last-child::after { display: none; }

/* FAQ */
.faq-section { margin-bottom: 80px; }
.faq-section .section-title { margin-bottom: 32px; }
.faq-list { display: flex; flex-direction: column; gap: 12px; }
.faq-item { background: var(--white); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; cursor: pointer; transition: border-color .2s; }
.faq-item:hover { border-color: var(--primary); }
.faq-q { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; font-weight: 600; color: var(--text); font-size: .95rem; }
.faq-icon { font-size: 1.4rem; color: var(--primary); font-weight: 300; flex-shrink: 0; margin-left: 16px; }
.faq-a { padding: 0 24px 20px; color: var(--text-muted); font-size: .9rem; line-height: 1.7; }

/* CTA */
.how-cta { background: linear-gradient(135deg, #0f172a, #034080); border-radius: var(--radius); padding: 64px; text-align: center; color: #fff; }
.how-cta h2 { font-size: 2rem; font-weight: 800; margin-bottom: 12px; }
.how-cta p { opacity: .8; margin-bottom: 32px; font-size: 1.05rem; }
.cta-btns { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }

@media (max-width: 900px) { .steps-grid { grid-template-columns: repeat(2, 1fr); } .step-card::after { display: none; } }
@media (max-width: 600px) { .steps-grid { grid-template-columns: 1fr; } .how-cta { padding: 40px 24px; } .how-cta h2 { font-size: 1.5rem; } .cta-btns { flex-direction: column; } }
</style>
