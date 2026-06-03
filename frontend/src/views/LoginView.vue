<template>
  <div class="auth-page">
    <div class="auth-visual">
      <img src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=700&h=900&fit=crop" alt="Logement" />
      <div class="visual-overlay">
        <blockquote>"Trouver un logement n'a jamais été aussi simple."</blockquote>
      </div>
    </div>

    <div class="auth-form-area">
      <div class="auth-card">
        <RouterLink to="/" class="back-link">← Retour à l'accueil</RouterLink>
        <h1>Connexion</h1>
        <p class="auth-subtitle">Bienvenue ! Connectez-vous à votre espace.</p>

        <div v-if="auth.error" class="alert alert-error">{{ auth.error }}</div>

        <form @submit.prevent="handleLogin" novalidate>
          <div class="form-group">
            <label class="form-label">Adresse email</label>
            <input
              v-model="form.email"
              type="email"
              class="form-input"
              :class="{ 'input-error': emailTouched && !emailValid }"
              placeholder="vous@exemple.fr"
              @blur="emailTouched = true"
              required
            />
            <span v-if="emailTouched && !emailValid" class="form-error">
              Veuillez entrer une adresse email valide (ex: nom@domaine.fr)
            </span>
          </div>
          <div class="form-group">
            <label class="form-label">
              Mot de passe
              <a href="#" class="forgot-link">Oublié ?</a>
            </label>
            <div class="password-wrapper">
              <input v-model="form.password" :type="showPwd ? 'text' : 'password'" class="form-input" placeholder="••••••••" required />
              <button type="button" class="pwd-toggle" @click="showPwd = !showPwd">{{ showPwd ? '🙈' : '👁️' }}</button>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-block btn-lg" :disabled="auth.loading || !canSubmit">
            <span v-if="auth.loading" class="spinner" style="width:18px;height:18px;border-width:2px"></span>
            <span v-else>Se connecter</span>
          </button>
        </form>

        <div class="auth-sep"><span>ou</span></div>

        <p class="auth-switch">
          Pas encore de compte ?
          <RouterLink to="/register">Créer un compte gratuitement →</RouterLink>
        </p>

        <!-- Demo credentials -->
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
const emailTouched = ref(false)
const form = reactive({ email: '', password: '' })

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const emailValid = computed(() => EMAIL_REGEX.test(form.email.trim()))
const canSubmit = computed(() => emailValid.value && form.password.length > 0)

async function handleLogin() {
  emailTouched.value = true
  if (!emailValid.value) return
  auth.error = null
  const ok = await auth.login(form.email, form.password)
  if (ok) router.push('/dashboard')
}
</script>

<style scoped>
@import "../assets/css/auth.css";
</style>
