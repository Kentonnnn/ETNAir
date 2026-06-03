<template>
  <div class="user-avatar-wrap" :style="{ width: size + 'px', height: size + 'px' }">
    <img v-if="pic" :src="pic" :alt="initials" />
    <span v-else :style="{ fontSize: (size * 0.4) + 'px' }">{{ initials }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useProfilePic } from '@/stores/profilePic'

const props = defineProps({
  userId:    { type: [Number, String], default: null },
  firstName: { type: String, default: '' },
  lastName:  { type: String, default: '' },
  size:      { type: Number, default: 40 },
})

const { pic } = useProfilePic(props.userId)
const initials = computed(() => `${props.firstName?.[0] || ''}${props.lastName?.[0] || ''}`.toUpperCase() || '?')
</script>

<style scoped>
.user-avatar-wrap {
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
  overflow: hidden;
}
.user-avatar-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
:global([data-theme="dark"]) .user-avatar-wrap { background: #fff; color: #000; }
</style>
