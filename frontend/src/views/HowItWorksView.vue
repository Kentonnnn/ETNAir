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
        <p>Plus de 500 logements disponibles partout en France.</p>
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
  { icon: '📄', title: 'Envoyez vos justificatifs', desc: 'Téléchargez vos documents (pièce d\'identité, justificatif et garant) directement depuis votre espace personnel.' },
  { icon: '🔑', title: 'Bienvenue chez vous !', desc: 'Une fois votre dossier accepté, coordonnez votre arrivée avec le propriétaire et emménagez dans votre nouveau logement.' },
]

const faq = reactive([
  { q: 'Combien de temps prend le traitement d\'un dossier ?', a: 'En général, les propriétaires répondent sous 48 à 72 heures. Vous recevrez une notification dès qu\'une décision est prise.', open: false },
  { q: 'Quels documents sont nécessaires ?', a: 'Une pièce d\'identité valide, un justificatif de scolarité, et un garant (parents ou organisme de cautionnement). Certains propriétaires peuvent demander des justificatifs supplémentaires.', open: false },
  { q: 'La plateforme est-elle gratuite ?', a: 'Oui, ETNAir est entièrement gratuit. Aucun frais de dossier ni commission n\'est prélevé.', open: false },
  { q: 'Comment contacter le propriétaire ?', a: 'Les coordonnées du propriétaire sont visibles sur chaque fiche annonce. Vous pouvez également envoyer un message directement depuis la plateforme.', open: false },
])
</script>

<style scoped>
@import "../assets/css/how-it-works.css";
</style>
