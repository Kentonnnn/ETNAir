<template>
  <span ref="el">0</span>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  target:   { type: Number, required: true },
  duration: { type: Number, default: 1800 },
  suffix:   { type: String, default: '' },
})

const el = ref(null)

onMounted(() => {
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return
    observer.disconnect()

    const start = performance.now()
    function update(now) {
      const t = Math.min((now - start) / props.duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      el.value.textContent = Math.floor(eased * props.target) + props.suffix
      if (t < 1) requestAnimationFrame(update)
      else el.value.textContent = props.target + props.suffix
    }
    requestAnimationFrame(update)
  }, { threshold: 0.5 })

  if (el.value) observer.observe(el.value)
})
</script>
