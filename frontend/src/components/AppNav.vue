<template>
  <header :class="['navbar', { scrolled: isScrolled, 'menu-open': menuOpen }]">
    <div class="container nav-inner">
      <!-- Logo -->
      <RouterLink to="/" class="logo">
        <span class="logo-icon">✈</span>
        <span class="logo-text">ETN<strong>Air</strong></span>
      </RouterLink>

      <!-- Desktop nav -->
      <nav class="nav-links">
        <RouterLink to="/annonces" class="nav-link">Nos logements</RouterLink>
        <RouterLink to="/" class="nav-link" @click="scrollTo('how')">Comment réserver ?</RouterLink>
        <RouterLink to="/" class="nav-link" @click="scrollTo('about')">Qui sommes-nous ?</RouterLink>
      </nav>

      <!-- CTA area -->
      <div class="nav-cta">
        <template v-if="auth.isLoggedIn">
          <RouterLink to="/dashboard" class="nav-user">
            <div class="user-avatar">{{ initials }}</div>
            <span class="user-name">{{ auth.user?.firstName }}</span>
          </RouterLink>
          <button class="btn btn-outline btn-sm" @click="handleLogout">Déconnexion</button>
        </template>
        <template v-else>
          <RouterLink to="/login" class="nav-link nav-login">Connexion</RouterLink>
          <RouterLink to="/register" class="btn btn-primary btn-sm">Inscription</RouterLink>
        </template>
      </div>

      <!-- Burger -->
      <button class="burger" @click="menuOpen = !menuOpen" :aria-expanded="menuOpen">
        <span></span><span></span><span></span>
      </button>
    </div>

    <!-- Mobile menu -->
    <Transition name="slide-down">
      <div v-if="menuOpen" class="mobile-menu">
        <RouterLink to="/annonces" class="mobile-link" @click="menuOpen=false">Nos logements</RouterLink>
        <RouterLink to="/login" class="mobile-link" @click="menuOpen=false" v-if="!auth.isLoggedIn">Connexion</RouterLink>
        <RouterLink to="/register" class="mobile-link" @click="menuOpen=false" v-if="!auth.isLoggedIn">Inscription</RouterLink>
        <RouterLink to="/dashboard" class="mobile-link" @click="menuOpen=false" v-if="auth.isLoggedIn">Mon espace</RouterLink>
        <button class="mobile-link" @click="handleLogout" v-if="auth.isLoggedIn">Déconnexion</button>
      </div>
    </Transition>
  </header>
  <!-- Spacer -->
  <div style="height: var(--nav-h)"></div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const isScrolled = ref(false)
const menuOpen = ref(false)

const initials = computed(() => {
  if (!auth.user) return ''
  return `${auth.user.firstName?.[0] || ''}${auth.user.lastName?.[0] || ''}`.toUpperCase()
})

function handleLogout() {
  auth.logout()
  menuOpen.value = false
  router.push('/')
}

function scrollTo(id) {
  menuOpen.value = false
  setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 100)
}

function onScroll() { isScrolled.value = window.scrollY > 20 }
onMounted(() => window.addEventListener('scroll', onScroll))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
.navbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  height: var(--nav-h); background: var(--white);
  border-bottom: 1px solid transparent;
  transition: all .3s ease;
}
.navbar.scrolled { box-shadow: var(--shadow); border-color: var(--border); }
.nav-inner { display: flex; align-items: center; gap: 32px; height: 100%; }
.logo { display: flex; align-items: center; gap: 8px; text-decoration: none; flex-shrink: 0; }
.logo-icon { font-size: 1.4rem; }
.logo-text { font-size: 1.3rem; font-weight: 500; color: var(--text); }
.logo-text strong { color: var(--primary); font-weight: 800; }
.nav-links { display: flex; gap: 4px; flex: 1; }
.nav-link { padding: 8px 14px; border-radius: 8px; font-size: .9rem; font-weight: 500; color: var(--text-muted); transition: all var(--transition); cursor: pointer; background: none; border: none; }
.nav-link:hover, .nav-link.router-link-active { color: var(--primary); background: var(--primary-light); }
.nav-login { color: var(--text); }
.nav-cta { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.nav-user { display: flex; align-items: center; gap: 8px; text-decoration: none; }
.user-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: .8rem; font-weight: 700; }
.user-name { font-size: .9rem; font-weight: 600; color: var(--text); }
.burger { display: none; flex-direction: column; gap: 5px; background: none; border: none; padding: 8px; margin-left: auto; }
.burger span { display: block; width: 24px; height: 2px; background: var(--text); border-radius: 2px; transition: all .3s; }
.mobile-menu { position: absolute; top: var(--nav-h); left: 0; right: 0; background: var(--white); border-bottom: 1px solid var(--border); padding: 12px 24px 20px; display: flex; flex-direction: column; gap: 4px; box-shadow: var(--shadow); }
.mobile-link { padding: 12px 16px; font-size: .95rem; font-weight: 500; color: var(--text); border-radius: 8px; text-decoration: none; background: none; border: none; text-align: left; cursor: pointer; }
.mobile-link:hover { background: var(--primary-light); color: var(--primary); }
.slide-down-enter-active, .slide-down-leave-active { transition: all .25s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-10px); }
@media (max-width: 768px) {
  .nav-links, .nav-cta { display: none; }
  .burger { display: flex; }
}
</style>