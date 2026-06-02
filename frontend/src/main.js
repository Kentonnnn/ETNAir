import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)

// ── v-reveal : scroll-triggered entrance animation ──────────────────
app.directive('reveal', {
  mounted(el, binding) {
    const dir = binding.value || 'up'
    el.classList.add(`reveal-${dir}`)
    const delay = el.dataset.delay ? parseInt(el.dataset.delay) : 0
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setTimeout(() => el.classList.add('is-visible'), delay)
      observer.disconnect()
    }, { threshold: 0.12 })
    observer.observe(el)
  },
})

// Prefetch Lottie JSON for route transitions
try {
  if (typeof fetch === 'function') {
    fetch('/travel-loader.json', { cache: 'force-cache' })
      .then(res => { if (res.ok) return res.json(); throw new Error('not-ok') })
      .then(json => { window.__LOTTIE_TRAVEL_JSON = json })
      .catch(() => {})
  }
} catch (e) {}

app.mount('#app')

// ── Ripple + Magnetic (after mount) ────────────────────────────────
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn')
  if (!btn) return
  const rect = btn.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height) * 2.5
  const ripple = document.createElement('span')
  ripple.className = 'ripple-el'
  ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px;`
  btn.appendChild(ripple)
  setTimeout(() => ripple.remove(), 600)
})

document.addEventListener('mousemove', (e) => {
  const btn = e.target.closest('.btn-lg, .btn-accent')
  if (!btn) return
  const rect = btn.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 10
  const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 10
  btn.style.transform = `translate(${x}px, ${y}px)`
}, { passive: true })

document.addEventListener('mouseout', (e) => {
  const btn = e.target.closest?.('.btn-lg, .btn-accent')
  if (btn) btn.style.transform = ''
})
