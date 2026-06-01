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
.create-header { background: linear-gradient(135deg, var(--primary-dark), var(--primary)); color: #fff; padding: 48px 0; }
.back-link { display: inline-block; color: rgba(255,255,255,.7); font-size: .85rem; margin-bottom: 16px; transition: color var(--transition); }
.back-link:hover { color: #fff; }
.create-header h1 { font-size: 2rem; font-weight: 800; margin-bottom: 8px; }
.create-header h1 span { color: var(--accent); }
.create-header p { opacity: .8; }
.create-body { padding: 40px 24px 80px; }
.create-grid { display: grid; grid-template-columns: 1fr 340px; gap: 40px; align-items: start; }
.create-form { background: var(--white); border-radius: var(--radius); border: 1px solid var(--border); padding: 32px; }
.form-section { margin-bottom: 36px; padding-bottom: 36px; border-bottom: 1px solid var(--border); }
.form-section:last-of-type { border-bottom: none; margin-bottom: 24px; }
.form-section-title { font-size: 1rem; font-weight: 700; color: var(--text); margin-bottom: 20px; }
textarea.form-input { resize: vertical; font-family: var(--font); }
.char-count { font-size: .78rem; color: var(--text-muted); text-align: right; margin-top: 4px; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.existing-thumbs { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 8px; }
.thumb-wrapper { position: relative; }
.thumb { width: 80px; height: 80px; object-fit: cover; border-radius: 6px; border: 2px solid transparent; transition: opacity .2s, border-color .2s; }
.to-remove + .thumb, .thumb-wrapper:has(.to-remove) .thumb { opacity: .35; border-color: var(--danger); }
.thumb-remove { position: absolute; top: -6px; right: -6px; background: #ef4444; color: #fff; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 11px; cursor: pointer; line-height: 20px; text-align: center; padding: 0; }
.thumb-remove.to-remove { background: var(--primary); }
.remove-note { font-size: .8rem; color: var(--danger); margin-top: 6px; }
.dropzone { border: 2px dashed #ccc; border-radius: 10px; padding: 24px; text-align: center; cursor: pointer; transition: border-color .2s; min-height: 90px; }
.dropzone:hover { border-color: var(--primary); }
.preview-thumbnails { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
.preview-area { position: sticky; top: calc(var(--nav-h) + 24px); }
.preview-title { font-weight: 700; color: var(--text); margin-bottom: 16px; }
.preview-card { background: var(--white); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
.preview-img { height: 180px; }
.preview-img img { width: 100%; height: 100%; object-fit: cover; }
.preview-body { padding: 16px; }
.preview-city { font-size: .8rem; color: var(--text-muted); margin-bottom: 6px; }
.preview-name { font-size: 1rem; font-weight: 700; margin-bottom: 6px; }
.preview-price { font-size: .9rem; color: var(--text-muted); }
.preview-price strong { color: var(--primary); font-size: 1.2rem; }
@media (max-width: 900px) { .create-grid { grid-template-columns: 1fr; } .preview-area { position: static; } }
@media (max-width: 600px) { .two-col { grid-template-columns: 1fr; } }
</style>
