<template>
  <div id="app">
    <AppNav />
    <main>
      <RouterView />
    </main>
    <AppFooter />
    <Transition name="fade">
      <div v-if="toast.visible" :class="['toast', toast.type]">{{ toast.message }}</div>
    </Transition>
    <PageVolet />
  </div>
</template>

<script setup>
import { reactive, provide, onMounted, onUnmounted } from 'vue'
import AppNav from '@/components/AppNav.vue'
import AppFooter from '@/components/AppFooter.vue'
import PageVolet from '@/components/PageVolet.vue'
import { useThemeStore } from '@/stores/theme'

useThemeStore()

const toast = reactive({ visible: false, message: '', type: 'success' })
let toastTimer = null

function showToast(message, type = 'success') {
  clearTimeout(toastTimer)
  toast.message = message; toast.type = type; toast.visible = true
  toastTimer = setTimeout(() => { toast.visible = false }, 3000)
}
provide('showToast', showToast)

function onRippleClick(e) {
  const btn = e.target.closest('.btn')
  if (!btn) return
  const rect = btn.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height) * 2.5
  const ripple = document.createElement('span')
  ripple.className = 'ripple-el'
  ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px;`
  btn.appendChild(ripple)
  setTimeout(() => ripple.remove(), 600)
}

onMounted(() => document.addEventListener('click', onRippleClick))
onUnmounted(() => document.removeEventListener('click', onRippleClick))
</script>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
