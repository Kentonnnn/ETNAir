import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { coverPage, uncoverPage } from '@/stores/pageTransition'

const routes = [
  { path: '/',             name: 'Home',         component: () => import('@/views/HomeView.vue') },
  { path: '/annonces',     name: 'Annonces',     component: () => import('@/views/AnnoncesView.vue') },
  { path: '/annonces/:id', name: 'AnnonceDetail',component: () => import('@/views/AnnonceDetailView.vue') },
  { path: '/login',        name: 'Login',        component: () => import('@/views/LoginView.vue'),        meta: { guest: true } },
  { path: '/register',     name: 'Register',     component: () => import('@/views/RegisterView.vue'),     meta: { guest: true } },
  { path: '/dashboard',    name: 'Dashboard',    component: () => import('@/views/DashboardView.vue'),    meta: { auth: true } },
  { path: '/favoris',      name: 'Favorites',    component: () => import('@/views/FavoritesView.vue'),    meta: { auth: true } },
  { path: '/annonces/create', name: 'CreateAnnonce', component: () => import('@/views/CreateAnnonceView.vue'), meta: { auth: true } },
  { path: '/annonces/:id/edit', name: 'EditAnnonce',   component: () => import('@/views/EditAnnonceView.vue'),   meta: { auth: true } },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

let isFirstNavigation = true

router.beforeEach(async (to, from) => {
  const auth = useAuthStore()
  if (to.meta.auth && !auth.isLoggedIn) return { name: 'Login' }
  if (to.meta.guest && auth.isLoggedIn) return { name: 'Home' }

  if (!isFirstNavigation && from.name) {
    await coverPage()
  }
  isFirstNavigation = false
})

router.afterEach(() => {
  uncoverPage()
})

export default router