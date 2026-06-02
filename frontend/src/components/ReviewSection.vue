<template>
  <div class="review-section">
    <div class="review-header">
      <h2>Avis {{ reviews.length ? `(${reviews.length})` : '' }}</h2>
      <div v-if="reviews.length" class="avg-rating">
        <span class="stars-display">
          <span v-for="n in 5" :key="n" :class="['star', { filled: n <= Math.round(avgRating) }]">★</span>
        </span>
        <strong>{{ avgRating.toFixed(1) }}</strong>
        <span class="avg-count">/ 5 — {{ reviews.length }} avis</span>
      </div>
    </div>

    <!-- New review form -->
    <div v-if="auth.isLoggedIn" class="review-form">
      <h3>Laisser un avis</h3>
      <div class="form-row">
        <label class="form-label">Note</label>
        <div class="stars-input">
          <button
            v-for="n in 5" :key="n" type="button"
            class="star-btn"
            :class="{ filled: n <= (hoverRating || form.rating) }"
            @click="form.rating = n"
            @mouseenter="hoverRating = n"
            @mouseleave="hoverRating = 0"
          >★</button>
          <span class="rating-text" v-if="form.rating">{{ form.rating }}/5</span>
        </div>
      </div>
      <div class="form-row">
        <label class="form-label">Votre commentaire</label>
        <textarea v-model="form.comment" class="form-input" rows="3" placeholder="Partagez votre expérience..."></textarea>
      </div>
      <button class="btn btn-primary" :disabled="!form.rating || !form.comment.trim()" @click="submitReview">
        Publier mon avis
      </button>
    </div>
    <div v-else class="review-login-prompt">
      <RouterLink to="/login">Connectez-vous</RouterLink> pour laisser un avis.
    </div>

    <!-- Reviews list -->
    <div v-if="reviews.length" class="reviews-list">
      <div v-for="r in reviews" :key="r.id" class="review-item">
        <div class="review-meta">
          <div class="review-avatar">
            <img v-if="getPic(r.userId)" :src="getPic(r.userId)" :alt="r.author" />
            <span v-else>{{ getInitials(r.author) }}</span>
          </div>
          <div>
            <strong>{{ r.author }}</strong>
            <span class="review-date">{{ formatDate(r.date) }}</span>
          </div>
          <span class="stars-display small">
            <span v-for="n in 5" :key="n" :class="['star', { filled: n <= r.rating }]">★</span>
          </span>
          <button
            v-if="auth.user && r.userId === auth.user.id"
            class="review-delete"
            @click="deleteReview(r.id)"
            title="Supprimer mon avis"
          >✕</button>
        </div>
        <p class="review-comment">{{ r.comment }}</p>
      </div>
    </div>
    <div v-else class="no-reviews">
      <p>Aucun avis pour le moment. Soyez le premier à partager votre expérience !</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getProfilePic } from '@/stores/profilePic'

function getPic(userId) { return getProfilePic(userId) }

const props = defineProps({
  listingId: { type: [Number, String], required: true },
})

const auth = useAuthStore()
const showToast = inject('showToast', null)

const reviews = ref([])
const hoverRating = ref(0)
const form = ref({ rating: 0, comment: '' })

const STORAGE_KEY = 'etnair_reviews'

function loadAll() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
  catch { return {} }
}

function loadForListing() {
  const all = loadAll()
  reviews.value = (all[props.listingId] || []).sort((a, b) => new Date(b.date) - new Date(a.date))
}

function persist() {
  const all = loadAll()
  all[props.listingId] = reviews.value
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

function submitReview() {
  if (!form.value.rating || !form.value.comment.trim()) return
  const review = {
    id: Date.now() + Math.random(),
    userId: auth.user.id,
    author: `${auth.user.firstName} ${auth.user.lastName}`,
    rating: form.value.rating,
    comment: form.value.comment.trim(),
    date: new Date().toISOString(),
  }
  reviews.value = [review, ...reviews.value]
  persist()
  form.value = { rating: 0, comment: '' }
  hoverRating.value = 0
  showToast?.('Avis publié !', 'success')
}

function deleteReview(id) {
  if (!confirm('Supprimer cet avis ?')) return
  reviews.value = reviews.value.filter(r => r.id !== id)
  persist()
  showToast?.('Avis supprimé', 'success')
}

function getInitials(name) {
  return name.split(' ').map(s => s[0] || '').slice(0, 2).join('').toUpperCase()
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

const avgRating = computed(() => {
  if (!reviews.value.length) return 0
  return reviews.value.reduce((sum, r) => sum + r.rating, 0) / reviews.value.length
})

watch(() => props.listingId, loadForListing, { immediate: true })
</script>

<style scoped>
.review-section { margin-top: 48px; padding-top: 32px; border-top: 1px solid var(--border); }
.review-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 12px; }
.review-header h2 { font-size: 1.2rem; font-weight: 700; color: var(--text); }
.avg-rating { display: flex; align-items: center; gap: 8px; font-size: .9rem; color: var(--text-muted); }
.avg-rating strong { color: var(--text); font-size: 1.1rem; }
.avg-count { font-size: .85rem; }

/* Stars */
.stars-display { display: inline-flex; gap: 2px; }
.stars-display .star { font-size: 1.1rem; color: var(--border); transition: color .2s ease; }
.stars-display .star.filled { color: #f5a623; }
.stars-display.small .star { font-size: .9rem; }

.stars-input { display: flex; gap: 4px; align-items: center; }
.star-btn { background: none; border: none; font-size: 1.6rem; color: var(--border); cursor: pointer; padding: 0; transition: color .15s ease, transform .15s ease; }
.star-btn:hover { transform: scale(1.15); }
.star-btn.filled { color: #f5a623; }
.rating-text { margin-left: 12px; font-size: .9rem; color: var(--text-muted); }

/* Form */
.review-form { background: var(--white); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; margin-bottom: 32px; }
.review-form h3 { font-size: 1rem; font-weight: 700; color: var(--text); margin-bottom: 16px; }
.form-row { margin-bottom: 16px; }

.review-login-prompt {
  background: var(--white);
  border: 1px dashed var(--border);
  border-radius: var(--radius);
  padding: 16px 20px;
  text-align: center;
  color: var(--text-muted);
  font-size: .9rem;
  margin-bottom: 32px;
}
.review-login-prompt a { color: var(--primary); font-weight: 600; }

/* Reviews list */
.reviews-list { display: flex; flex-direction: column; gap: 20px; }
.review-item { background: var(--white); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px 24px; }
.review-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.review-avatar { width: 38px; height: 38px; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: .85rem; flex-shrink: 0; overflow: hidden; }
.review-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
.review-meta strong { display: block; font-size: .9rem; color: var(--text); }
.review-date { font-size: .8rem; color: var(--text-muted); }
.review-meta .stars-display { margin-left: auto; }
.review-delete { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1rem; transition: color .2s; padding: 4px 8px; border-radius: 4px; }
.review-delete:hover { color: var(--danger); background: rgba(231,76,60,.1); }
.review-comment { font-size: .9rem; color: var(--text-muted); line-height: 1.7; }

.no-reviews { text-align: center; padding: 32px; color: var(--text-muted); font-size: .9rem; }

/* Dark mode */
:global([data-theme="dark"]) .review-form,
:global([data-theme="dark"]) .review-item,
:global([data-theme="dark"]) .review-login-prompt {
  background: var(--white);
  border-color: var(--border);
}
:global([data-theme="dark"]) .review-avatar { background: #fff; color: #000; }
</style>
