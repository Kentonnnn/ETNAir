<template>
  <div class="scroll-progress" aria-hidden="true">
    <div class="sp-track">
      <div class="sp-thumb" :style="{ top: percent + '%' }">
        <span class="sp-label">{{ Math.round(percent) }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const percent = ref(0)
let ticking = false

function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => {
    const h = document.documentElement
    const scrolled = h.scrollTop || document.body.scrollTop
    const total = (h.scrollHeight || document.body.scrollHeight) - h.clientHeight
    percent.value = total > 0 ? Math.min(100, (scrolled / total) * 100) : 0
    ticking = false
  })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  onScroll()
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
})
</script>

<style scoped>
.scroll-progress {
  position: fixed;
  top: calc(var(--nav-h) + 24px);
  right: 18px;
  bottom: 24px;
  z-index: 900;
  pointer-events: none;
  display: flex;
  align-items: stretch;
}

.sp-track {
  position: relative;
  width: 2px;
  height: 100%;
  background: rgba(0, 0, 0, .08);
  border-radius: 2px;
  overflow: visible;
}

.sp-thumb {
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--primary);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 18%, transparent);
  transition: top 0.15s linear, box-shadow 0.25s ease;
}

.sp-thumb::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  transform: translate(-50%, -100%);
  width: 1px;
  height: 999px;
  background: linear-gradient(to bottom, transparent, var(--primary));
  opacity: .35;
  pointer-events: none;
}

.sp-label {
  position: absolute;
  right: calc(100% + 14px);
  top: 50%;
  transform: translateY(-50%);
  font-family: var(--font);
  font-size: .7rem;
  font-weight: 600;
  color: var(--text-muted);
  background: var(--white);
  padding: 3px 8px;
  border-radius: 12px;
  border: 1px solid var(--border);
  white-space: nowrap;
  opacity: 0;
  transition: opacity .2s ease, transform .2s ease;
  pointer-events: none;
}

.scroll-progress:hover .sp-label,
.sp-thumb:hover .sp-label { opacity: 1; }

/* Dark mode — pure white indicator on dark track */
[data-theme="dark"] .sp-track { background: rgba(255, 255, 255, .08); }
[data-theme="dark"] .sp-thumb {
  background: #fff;
  box-shadow: 0 0 0 4px rgba(255, 255, 255, .12);
}
[data-theme="dark"] .sp-thumb::before {
  background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, .5));
}
[data-theme="dark"] .sp-label {
  background: #111;
  color: #fff;
  border-color: rgba(255, 255, 255, .12);
}

@media (max-width: 768px) {
  .scroll-progress { display: none; }
}
</style>
