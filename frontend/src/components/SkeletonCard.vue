<template>
  <div class="skeleton-card">
    <div class="sk-img shimmer" />
    <div class="sk-body">
      <div class="sk-line shimmer" style="width:40%;height:12px;margin-bottom:10px" />
      <div class="sk-line shimmer" style="width:85%;height:16px;margin-bottom:8px" />
      <div class="sk-line shimmer" style="width:65%;height:12px;margin-bottom:20px" />
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div class="sk-line shimmer" style="width:30%;height:22px" />
        <div class="sk-line shimmer" style="width:20%;height:22px;border-radius:50px" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-card {
  background: var(--white);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  overflow: hidden;
}
.sk-img {
  height: 200px;
  width: 100%;
}
.sk-body { padding: 16px; }
.sk-line { border-radius: 6px; }

.shimmer {
  background: linear-gradient(90deg,
    var(--border) 0%,
    color-mix(in srgb, var(--border) 40%, var(--white)) 50%,
    var(--border) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
