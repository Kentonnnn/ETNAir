<template>
  <div class="volet" :class="phase">
    <div class="volet-inner">
      <span class="volet-logo">ETN<strong>Air</strong></span>
    </div>
  </div>
</template>

<script setup>
import { voletPhase as phase } from '@/stores/pageTransition'
</script>

<style scoped>
.volet {
  position: fixed;
  inset: 0;
  background: #000;
  z-index: 9999;
  transform: translateX(-100%);
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.volet.covering {
  transform: translateX(0);
  pointer-events: all;
  transition: transform 0.65s cubic-bezier(0.76, 0, 0.24, 1);
}
.volet.covered {
  transform: translateX(0);
}
.volet.uncovering {
  transform: translateX(100%);
  transition: transform 0.65s cubic-bezier(0.76, 0, 0.24, 1);
}
.volet.idle {
  transform: translateX(-100%);
  transition: none;
}

.volet-inner {
  opacity: 0;
  transition: opacity 0.2s ease;
}
.volet.covered .volet-inner {
  opacity: 1;
}

.volet-logo {
  font-family: 'Poppins', sans-serif;
  font-size: 1.4rem;
  font-weight: 500;
  color: rgba(255,255,255,0.15);
  letter-spacing: 0.02em;
}
.volet-logo strong {
  color: rgba(255,255,255,0.3);
  font-weight: 800;
}
</style>
