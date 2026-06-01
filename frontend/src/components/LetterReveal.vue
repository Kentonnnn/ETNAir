<template>
  <span ref="el" class="letter-reveal-wrap" :class="{ 'is-visible': visible }">
    <span
      v-for="(ch, i) in chars"
      :key="i"
      class="lr-letter"
      :style="{ animationDelay: `${delay + i * stagger}ms` }"
    >{{ ch === ' ' ? ' ' : ch }}</span>
  </span>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  text:    { type: String, required: true },
  delay:   { type: Number, default: 0 },
  stagger: { type: Number, default: 40 },
})

const el = ref(null)
const visible = ref(false)
const chars = computed(() => props.text.split(''))

onMounted(() => {
  const observer = new IntersectionObserver(
    ([entry]) => { if (entry.isIntersecting) { visible.value = true; observer.disconnect() } },
    { threshold: 0.2 }
  )
  if (el.value) observer.observe(el.value)
})
</script>
