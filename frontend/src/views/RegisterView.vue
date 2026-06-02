<template>
  <div class="auth-page">
    <div class="auth-visual">
      <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=700&h=900&fit=crop" alt="Logement" />
      <div class="visual-overlay">
        <div class="visual-logo">✈ ETN<strong>Air</strong></div>
        <div class="visual-features">
          <div v-for="f in features" :key="f" class="visual-feature">
            <span>✓</span> {{ f }}
          </div>
        </div>
      </div>
    </div>

    <div class="auth-form-area">
      <div class="auth-card">
        <RouterLink to="/" class="back-link">← Retour à l'accueil</RouterLink>
        <h1>Créer un compte</h1>
        <p class="auth-subtitle">Rejoignez des milliers d'étudiants sur ETNAir !</p>

        <div v-if="auth.error" class="alert alert-error">{{ auth.error }}</div>

        <form @submit.prevent="handleRegister">
          <div class="name-row">
            <div class="form-group">
              <label class="form-label">Prénom</label>
              <input v-model="form.firstName" class="form-input" placeholder="Alice" required />
            </div>
            <div class="form-group">
              <label class="form-label">Nom</label>
              <input v-model="form.lastName" class="form-input" placeholder="Dupont" required />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Adresse email</label>
            <input v-model="form.email" type="email" class="form-input" placeholder="vous@exemple.fr" required />
          </div>

          <div class="form-group">
            <label class="form-label">Mot de passe <span class="hint">(min. 8 caractères)</span></label>
            <div class="password-wrapper">
              <input v-model="form.password" :type="showPwd ? 'text' : 'password'" class="form-input" placeholder="••••••••" required minlength="8" />
              <button type="button" class="pwd-toggle" @click="showPwd = !showPwd">{{ showPwd ? '🙈' : '👁️' }}</button>
            </div>
            <!-- Strength indicator -->
            <div class="strength-bar" v-if="form.password">
              <div :class="['strength-fill', strengthClass]" :style="{ width: strengthPct + '%' }"></div>
            </div>
            <span v-if="form.password" :class="['strength-label', strengthClass]">{{ strengthLabel }}</span>
          </div>

          <div class="form-group">
            <label class="form-label">Vous êtes</label>
            <div class="role-toggle">
              <button type="button" :class="['role-btn', { active: form.role === 'tenant' }]" @click="form.role = 'tenant'">
                🎓 Locataire
              </button>
              <button type="button" :class="['role-btn', { active: form.role === 'owner' }]" @click="form.role = 'owner'">
                🏠 Propriétaire
              </button>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-block btn-lg" :disabled="auth.loading">
            <span v-if="auth.loading" class="spinner" style="width:18px;height:18px;border-width:2px"></span>
            <span v-else>Créer mon compte</span>
          </button>

          <p class="terms">En créant un compte, vous acceptez nos <a href="#">CGU</a> et notre <a href="#">politique de confidentialité</a>.</p>
        </form>

        <div class="auth-sep"><span>ou</span></div>

        <p class="auth-switch">
          Déjà un compte ?
          <RouterLink to="/login">Se connecter →</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const showPwd = ref(false)
const form = reactive({ firstName: '', lastName: '', email: '', password: '', role: 'tenant' })

const features = ['Inscription gratuite', 'Milliers d\'annonces', 'Propriétaires vérifiés', 'Réservation rapide']

const strengthScore = computed(() => {
  const p = form.password
  if (!p) return 0
  let s = 0
  if (p.length >= 8) s++
  if (/[A-Z]/.test(p)) s++
  if (/[0-9]/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return s
})
const strengthPct = computed(() => [0, 25, 50, 75, 100][strengthScore.value])
const strengthClass = computed(() => ['', 'weak', 'fair', 'good', 'strong'][strengthScore.value])
const strengthLabel = computed(() => ['', 'Faible', 'Passable', 'Bon', 'Fort'][strengthScore.value])

async function handleRegister() {
  auth.error = null
  const ok = await auth.register(form)
  if (ok) router.push('/dashboard')
}
</script>

<style scoped>
@import "../assets/css/register.css";
</style>
