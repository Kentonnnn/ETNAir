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
.auth-page { display: grid; grid-template-columns: 1fr 1fr; min-height: calc(100vh - var(--nav-h)); }
.auth-visual { position: relative; overflow: hidden; }
.auth-visual img { width: 100%; height: 100%; object-fit: cover; }
.visual-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(4,88,160,.9) 40%, rgba(4,88,160,.4)); display: flex; flex-direction: column; justify-content: flex-end; padding: 48px; color: #fff; }
.visual-logo { font-size: 1.6rem; font-weight: 600; margin-bottom: 32px; }
.visual-logo strong { font-weight: 800; }
.visual-features { display: flex; flex-direction: column; gap: 12px; }
.visual-feature { display: flex; align-items: center; gap: 10px; font-size: 1rem; }
.visual-feature span { width: 22px; height: 22px; background: var(--accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: .75rem; font-weight: 700; flex-shrink: 0; }
.auth-form-area { display: flex; align-items: center; justify-content: center; padding: 40px 24px; background: var(--bg); overflow-y: auto; }
.auth-card { width: 100%; max-width: 480px; }
.back-link { display: inline-block; font-size: .85rem; color: var(--text-muted); text-decoration: none; margin-bottom: 24px; transition: color var(--transition); }
.back-link:hover { color: var(--primary); }
.auth-card h1 { font-size: 1.9rem; font-weight: 800; color: var(--text); margin-bottom: 8px; }
.auth-subtitle { color: var(--text-muted); margin-bottom: 28px; }
.name-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.hint { font-weight: 400; color: var(--text-muted); font-size: .8rem; }
.password-wrapper { position: relative; }
.password-wrapper .form-input { padding-right: 44px; }
.pwd-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 1rem; cursor: pointer; }
.strength-bar { height: 4px; background: var(--border); border-radius: 2px; margin-top: 8px; overflow: hidden; }
.strength-fill { height: 100%; border-radius: 2px; transition: width .3s ease, background .3s ease; }
.strength-fill.weak { background: var(--danger); }
.strength-fill.fair { background: var(--accent); }
.strength-fill.good { background: #3b82f6; }
.strength-fill.strong { background: var(--success); }
.strength-label { font-size: .75rem; margin-top: 4px; display: block; }
.strength-label.weak { color: var(--danger); }
.strength-label.fair { color: var(--accent-dark); }
.strength-label.good { color: #3b82f6; }
.strength-label.strong { color: var(--success); }
.role-toggle { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.role-btn { padding: 14px; border: 2px solid var(--border); border-radius: var(--radius-sm); background: var(--white); font-family: var(--font); font-size: .95rem; font-weight: 600; color: var(--text-muted); cursor: pointer; transition: all var(--transition); }
.role-btn:hover { border-color: var(--primary); color: var(--primary); }
.role-btn.active { border-color: var(--primary); background: var(--primary-light); color: var(--primary); }
.terms { font-size: .78rem; color: var(--text-muted); text-align: center; margin-top: 12px; line-height: 1.5; }
.terms a { color: var(--primary); }
.auth-sep { display: flex; align-items: center; gap: 12px; margin: 20px 0; color: var(--text-muted); font-size: .85rem; }
.auth-sep::before, .auth-sep::after { content: ''; flex: 1; height: 1px; background: var(--border); }
.auth-switch { text-align: center; font-size: .9rem; color: var(--text-muted); }
.auth-switch a { color: var(--primary); font-weight: 600; }
@media (max-width: 768px) { .auth-page { grid-template-columns: 1fr; } .auth-visual { display: none; } .name-row { grid-template-columns: 1fr; } }
</style>