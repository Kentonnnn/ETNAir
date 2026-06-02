<template>
  <div class="cursor-dot"  :style="dotStyle"  />
  <div class="cursor-ring" :style="ringStyle" />
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'

const mouse  = reactive({ x: -100, y: -100 })
const ring   = reactive({ x: -100, y: -100 })
const scale  = ref(1)
const hidden = ref(false)

let raf = null

function lerp(a, b, t) { return a + (b - a) * t }

function loop() {
  ring.x = lerp(ring.x, mouse.x, 0.12)
  ring.y = lerp(ring.y, mouse.y, 0.12)
  raf = requestAnimationFrame(loop)
}

function onMouseMove(e) {
  mouse.x = e.clientX
  mouse.y = e.clientY
  hidden.value = false
}

function onEnter(e) {
  if (e.target.closest('a, button, .btn, .listing-card, .nav-link, .tab, .cat-card')) scale.value = 2.2
}
function onLeave(e) {
  if (e.target.closest('a, button, .btn, .listing-card, .nav-link, .tab, .cat-card')) scale.value = 1
}
function onLeaveWindow() { hidden.value = true }

onMounted(() => {
  document.addEventListener('mousemove', onMouseMove, { passive: true })
  document.addEventListener('mouseover', onEnter)
  document.addEventListener('mouseout',  onLeave)
  document.addEventListener('mouseleave', onLeaveWindow)
  loop()
})

onUnmounted(() => {
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseover', onEnter)
  document.removeEventListener('mouseout',  onLeave)
  document.removeEventListener('mouseleave', onLeaveWindow)
  cancelAnimationFrame(raf)
})

const dotStyle = computed(() => ({
  left:    mouse.x + 'px',
  top:     mouse.y + 'px',
  opacity: hidden.value ? 0 : 1,
}))

const ringStyle = computed(() => ({
  left:      ring.x + 'px',
  top:       ring.y + 'px',
  transform: `translate(-50%, -50%) scale(${scale.value})`,
  opacity:   hidden.value ? 0 : 1,
}))
</script>

<style>
* { cursor: none !important; }

.cursor-dot {
  position: fixed;
  width: 7px;
  height: 7px;
  background: #0458a0;
  border-radius: 50%;
  pointer-events: none;
  z-index: 99999;
  transform: translate(-50%, -50%);
  transition: opacity .2s;
  will-change: left, top;
  mix-blend-mode: difference;
}

.cursor-ring {
  position: fixed;
  width: 38px;
  height: 38px;
  border: 2px solid #0458a0;
  border-radius: 50%;
  pointer-events: none;
  z-index: 99998;
  transition: transform .25s cubic-bezier(.2,.8,.3,1), opacity .2s;
  will-change: left, top, transform;
  opacity: .7;
  mix-blend-mode: difference;
}

[data-theme="dark"] .cursor-dot  { background: #fff; mix-blend-mode: normal; }
[data-theme="dark"] .cursor-ring { border-color: rgba(255,255,255,.6); mix-blend-mode: normal; }
</style>
