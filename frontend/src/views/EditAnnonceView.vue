<template>
  <div class="create-page">
    <div class="create-header">
      <div class="container">
        <RouterLink to="/dashboard" class="back-link">← Mon tableau de bord</RouterLink>
        <h1>Modifier <span>l'annonce</span></h1>
        <p>Mettez à jour les informations de votre logement.</p>
      </div>
    </div>

    <div class="container create-body">
      <div v-if="loadingListing" class="page-loader"><div class="spinner"></div></div>

      <div v-else class="create-grid">
        <form class="create-form" @submit.prevent="handleSubmit">
          <div v-if="error" class="alert alert-error">{{ error }}</div>
          <div v-if="success" class="alert alert-success">{{ success }}</div>

          <div class="form-section">
            <h2 class="form-section-title">📝 Informations générales</h2>
            <div class="form-group">
              <label class="form-label">Titre de l'annonce *</label>
              <input v-model="form.title" class="form-input" placeholder="Ex: Studio meublé au cœur de Paris" required maxlength="100" />
              <div class="char-count">{{ form.title.length }}/100</div>
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea v-model="form.description" class="form-input" rows="5" placeholder="Décrivez votre logement..."></textarea>
            </div>
          </div>

          <div class="form-section">
            <h2 class="form-section-title">📍 Localisation & tarif</h2>
            <div class="two-col">
              <div class="form-group">
                <label class="form-label">Ville *</label>
                <input v-model="form.city" class="form-input" placeholder="Paris" required />
              </div>
              <div class="form-group">
                <label class="form-label">Prix / nuit (€) *</label>
                <input v-model.number="form.pricePerNight" type="number" min="1" step="0.01" class="form-input" placeholder="35.00" required />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h2 class="form-section-title">📅 Disponibilité</h2>
            <div class="two-col">
              <div class="form-group">
                <label class="form-label">Disponible du</label>
                <input v-model="form.availableFrom" type="date" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Jusqu'au</label>
                <input v-model="form.availableTo" type="date" class="form-input" :min="form.availableFrom" />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h2 class="form-section-title">📸 Photos du logement</h2>

            <!-- Existing images -->
            <div v-if="existingImages.length" class="form-group">
              <label class="form-label">Photos actuelles</label>
              <div class="existing-thumbs">
                <div v-for="img in existingImages" :key="img.id" class="thumb-wrapper">
                  <img :src="`/api${img.url}`" class="thumb" @error="(e) => e.target.src = FALLBACK" />
                  <button type="button" class="thumb-remove" @click="markRemove(img.id)" :class="{ 'to-remove': toRemoveIds.includes(img.id) }">
                    {{ toRemoveIds.includes(img.id) ? '↩' : '✕' }}
                  </button>
                </div>
              </div>
              <p v-if="toRemoveIds.length" class="remove-note">{{ toRemoveIds.length }} photo(s) sera(ont) supprimée(s) à la sauvegarde. Cliquez ↩ pour annuler.</p>
            </div>

            <!-- New images -->
            <div class="form-group">
              <label class="form-label">Ajouter des photos (max. {{ remainingSlots }} photo(s))</label>
              <div class="dropzone" @dragover.prevent @drop.prevent="onDrop" @click="$refs.fileInput.click()" v-if="remainingSlots > 0">
                <input ref="fileInput" type="file" accept="image/*" multiple style="display:none" @change="onFileChange" />
                <span v-if="!newPreviews.length">📂 Glissez vos photos ici ou <u>parcourir</u></span>
                <div v-else class="preview-thumbnails">
                  <div v-for="(src, i) in newPreviews" :key="i" class="thumb-wrapper">
                    <img :src="src" class="thumb" />
                    <button type="button" class="thumb-remove" @click.stop="removeNewImage(i)">✕</button>
                  </div>
                </div>
              </div>
              <p v-else class="char-count">Nombre maximum de photos atteint.</p>
              <div class="char-count">{{ newFiles.length }}/{{ remainingSlots }} nouvelle(s) photo(s)</div>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-lg btn-block" :disabled="loading">
            <span v-if="loading" class="spinner" style="width:18px;height:18px;border-width:2px"></span>
            <span v-else>Enregistrer les modifications</span>
          </button>
        </form>

        <!-- Preview -->
        <aside class="preview-area">
          <h3 class="preview-title">Aperçu</h3>
          <div class="preview-card">
            <div class="preview-img">
              <img :src="previewMainImg" alt="preview" />
            </div>
            <div class="preview-body">
              <div class="preview-city">📍 {{ form.city || 'Ville' }}</div>
              <div class="preview-name">{{ form.title || 'Titre' }}</div>
              <div class="preview-price"><strong>{{ form.pricePerNight || '—' }} €</strong> /nuit</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, inject, toRaw } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { listingService } from '@/services/api'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const showToast = inject('showToast')

const FALLBACK = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=220&fit=crop'

const loadingListing = ref(true)
const loading = ref(false)
const error = ref(null)
const success = ref(null)

const form = reactive({ title: '', description: '', city: '', pricePerNight: '', availableFrom: '', availableTo: '' })

const existingImages = ref([])
const toRemoveIds = ref([])
const newFiles = ref([])
const newPreviews = ref([])
const fileInput = ref(null)

const remainingSlots = computed(() => {
  const kept = existingImages.value.length - toRemoveIds.value.length
  return Math.max(0, 5 - kept - newFiles.value.length)
})

const previewMainImg = computed(() => {
  if (newPreviews.value.length) return newPreviews.value[0]
  const kept = existingImages.value.find(img => !toRemoveIds.value.includes(img.id))
  return kept ? `/api${kept.url}` : FALLBACK
})

function markRemove(imgId) {
  const idx = toRemoveIds.value.indexOf(imgId)
  if (idx === -1) toRemoveIds.value.push(imgId)
  else toRemoveIds.value.splice(idx, 1)
}

function onFileChange(e) {
  addImages(Array.from(e.target.files))
  e.target.value = ''
}

function onDrop(e) {
  addImages(Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')))
}

function addImages(files) {
  const slots = remainingSlots.value
  files.slice(0, slots).forEach(file => {
    newFiles.value.push(file)
    const reader = new FileReader()
    reader.onload = e => newPreviews.value.push(e.target.result)
    reader.readAsDataURL(file)
  })
}

function removeNewImage(index) {
  newFiles.value.splice(index, 1)
  newPreviews.value.splice(index, 1)
}

async function handleSubmit() {
  loading.value = true; error.value = null; success.value = null
  try {
    const payload = new FormData()
    Object.entries(form).forEach(([key, val]) => { if (val !== '') payload.append(key, val) })
    newFiles.value.forEach(file => payload.append('images', toRaw(file)))
    if (toRemoveIds.value.length) payload.append('removeImageIds', toRemoveIds.value.join(','))

    await listingService.update(route.params.id, payload)
    showToast?.('Annonce mise à jour !', 'success')
    router.push('/dashboard')
  } catch (e) {
    error.value = e.response?.data?.error || 'Erreur lors de la mise à jour'
  } finally { loading.value = false }
}

onMounted(async () => {
  try {
    const { data } = await listingService.getOne(route.params.id)
    const listing = data.listing

    if (listing.ownerId !== auth.user?.id) {
      router.push('/')
      return
    }

    form.title = listing.title
    form.description = listing.description ?? ''
    form.city = listing.city
    form.pricePerNight = Number(listing.pricePerNight)
    form.availableFrom = listing.availableFrom ? listing.availableFrom.split('T')[0] : ''
    form.availableTo = listing.availableTo ? listing.availableTo.split('T')[0] : ''
    existingImages.value = listing.images ?? []
  } catch {
    router.push('/dashboard')
  } finally {
    loadingListing.value = false
  }
})
</script>

<style scoped>
@import "../assets/css/edit-annonce.css";
</style>
