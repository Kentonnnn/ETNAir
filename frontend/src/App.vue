<template>
  <div id="app">
    <AppNav />
    <main class="app-main">
      <RouterView />
    </main>
    <AppFooter />
    <Transition name="fade">
      <div v-if="toast.visible" :class="['toast', toast.type]">{{ toast.message }}</div>
    </Transition>
    <PageVolet />
    <CustomCursor />
    <ScrollProgress />
  </div>
</template>

<script setup>
import { reactive, provide } from 'vue'
import AppNav from '@/components/AppNav.vue'
import AppFooter from '@/components/AppFooter.vue'
import PageVolet from '@/components/PageVolet.vue'
import CustomCursor from '@/components/CustomCursor.vue'
import ScrollProgress from '@/components/ScrollProgress.vue'
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

</script>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.app-main { background: var(--bg); position: relative; z-index: 1; min-height: calc(100vh - var(--nav-h)); }
</style>
