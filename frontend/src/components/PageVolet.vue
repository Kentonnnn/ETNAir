<template>
  <div class="volet" :class="phase">
    <div class="volet-inner">
      <div v-if="!loaded && (phase === 'covering' || phase === 'covered')" class="volet-fallback">
        <div class="spinner" style="width:40px;height:40px;border-width:4px"></div>
      </div>
      <div ref="lottieContainer" class="volet-lottie" aria-hidden="true"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { voletPhase as phase } from '@/stores/pageTransition'
import lottie from 'lottie-web'

const lottieContainer = ref(null)
const loaded = ref(false)
let animation = null

// Create the animation once but prefer the preloaded JSON if available.
onMounted(() => {
  if (!lottieContainer.value) return

  const opts = {
    container: lottieContainer.value,
    renderer: 'svg',
    loop: true,
    autoplay: false, // we'll start manually on transition
    rendererSettings: { preserveAspectRatio: 'xMidYMid meet' }
  }

  // Use preloaded animationData if present to avoid fetching during transition
  try {
    if (window && window.__LOTTIE_TRAVEL_JSON) {
      opts.animationData = window.__LOTTIE_TRAVEL_JSON
    } else {
      opts.path = '/travel-loader.json'
    }
  } catch (e) {
    opts.path = '/travel-loader.json'
  }

  animation = lottie.loadAnimation(opts)

  // mark loaded once data is ready to decide fallback visibility
  try {
    animation.addEventListener && animation.addEventListener('data_ready', () => { loaded.value = true })
  } catch (e) { /* ignore */ }

  // If transition is already covering/covered on mount, play immediately
  if (phase.value === 'covering' || phase.value === 'covered') animation.play()
})

// Play when covering/covered, stop when uncovering/idle
watch(phase, (val) => {
  if (!animation) return
  if (val === 'covering' || val === 'covered') {
    try { animation.goToAndPlay(0, true) } catch (e) { animation.play && animation.play() }
  } else if (val === 'uncovering' || val === 'idle') {
    try { animation.stop() } catch (e) { /* ignore */ }
  }
})

onBeforeUnmount(() => {
  animation?.destroy()
})
</script>

<style scoped>
.volet {
  position: fixed;
  inset: 0;
  /* loader background: change to blue */
  background: #0b67ff;
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
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}
.volet.covering .volet-inner,
.volet.covered .volet-inner {
  opacity: 1;
}

.volet-fallback { display:flex; align-items:center; justify-content:center; }
.volet-fallback .spinner { box-shadow: none; }

.volet-lottie {
  width: min(320px, 70vw);
  max-width: 420px;
  aspect-ratio: 1 / 1;
  background: transparent;
}
</style>
