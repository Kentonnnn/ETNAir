<template>
  <div class="auth-page">
    <div class="auth-visual">
      <img src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=700&h=900&fit=crop" alt="Logement" />
      <div class="visual-overlay">
        <div class="visual-logo">✈ ETN<strong>Air</strong></div>
        <blockquote>"Trouver son logement étudiant n'a jamais été aussi simple."</blockquote>
      </div>
    </div>

    <div class="auth-form-area">
      <div class="auth-card">
        <RouterLink to="/" class="back-link">← Retour à l'accueil</RouterLink>
        <h1>Connexion</h1>
        <p class="auth-subtitle">Bienvenue ! Connectez-vous à votre espace.</p>

        <div v-if="auth.error" class="alert alert-error">{{ auth.error }}</div>

        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label class="form-label">Adresse email</label>
            <input v-model="form.email" type="email" class="form-input" placeholder="vous@exemple.fr" required />
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

          <button type="submit" class="btn btn-primary btn-block btn-lg" :disabled="auth.loading">
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
        <div class="demo-box">
          <p class="demo-title">🧪 Compte de test</p>
          <p>Créez d'abord un compte via <RouterLink to="/register">l'inscription</RouterLink>, ou utilisez l'API Swagger pour en créer un.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const showPwd = ref(false)
const form = reactive({ email: '', password: '' })

async function handleLogin() {
  auth.error = null
  const ok = await auth.login(form.email, form.password)
  if (ok) router.push('/dashboard')
}
</script>

<style scoped>
.auth-page { display: grid; grid-template-columns: 1fr 1fr; min-height: calc(100vh - var(--nav-h)); }
.auth-visual { position: relative; overflow: hidden; }
.auth-visual img { width: 100%; height: 100%; object-fit: cover; }
.visual-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(4,88,160,.9) 30%, rgba(4,88,160,.4)); display: flex; flex-direction: column; justify-content: flex-end; padding: 48px; color: #fff; }
.visual-logo { font-size: 1.6rem; font-weight: 600; margin-bottom: 24px; }
.visual-logo strong { font-weight: 800; }
.visual-overlay blockquote { font-size: 1.1rem; font-style: italic; opacity: .9; line-height: 1.6; }
.auth-form-area { display: flex; align-items: center; justify-content: center; padding: 40px 24px; background: var(--bg); }
.auth-card { width: 100%; max-width: 440px; }
.back-link { display: inline-block; font-size: .85rem; color: var(--text-muted); text-decoration: none; margin-bottom: 32px; transition: color var(--transition); }
.back-link:hover { color: var(--primary); }
.auth-card h1 { font-size: 2rem; font-weight: 800; color: var(--text); margin-bottom: 8px; }
.auth-subtitle { color: var(--text-muted); margin-bottom: 32px; }
.form-label { display: flex; justify-content: space-between; align-items: center; }
.forgot-link { font-size: .82rem; color: var(--primary); }
.password-wrapper { position: relative; }
.password-wrapper .form-input { padding-right: 44px; }
.pwd-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 1rem; cursor: pointer; }
.auth-sep { display: flex; align-items: center; gap: 12px; margin: 24px 0; color: var(--text-muted); font-size: .85rem; }
.auth-sep::before, .auth-sep::after { content: ''; flex: 1; height: 1px; background: var(--border); }
.auth-switch { text-align: center; font-size: .9rem; color: var(--text-muted); }
.auth-switch a { color: var(--primary); font-weight: 600; }
.demo-box { margin-top: 24px; background: var(--primary-light); border: 1px solid var(--primary); border-radius: var(--radius-sm); padding: 14px 18px; font-size: .85rem; color: var(--text-muted); }
.demo-title { font-weight: 700; color: var(--primary); margin-bottom: 4px; }
.demo-box a { color: var(--primary); }
@media (max-width: 768px) { .auth-page { grid-template-columns: 1fr; } .auth-visual { display: none; } }
</style>