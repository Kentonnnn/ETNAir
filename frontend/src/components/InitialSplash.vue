<template>
  <div class="initial-splash" v-if="visible">
    <img class="splash-logo" src="/logo.png" alt="ETNAir logo" @load="onLogoLoaded" @error="onLogoError" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['hide'])
const visible = ref(true)

function hideSplash() {
  if (!visible.value) return
  visible.value = false
  emit('hide')
}

function onLogoLoaded() {
  setTimeout(hideSplash, 1800)
}

function onLogoError() {
  setTimeout(hideSplash, 600)
}
</script>

<style scoped>
.initial-splash {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  z-index: 10000;
}
.splash-logo {
  height: 160px; width: auto;
  animation: splashPulse 1.8s ease-in-out both;
}

@keyframes splashPulse {
  0% { opacity: 0; transform: scale(0.8) translateY(10px); }
  50% { opacity: 1; transform: scale(1.05) translateY(0); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
