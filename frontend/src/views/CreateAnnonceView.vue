<template>
  <div class="create-page">
    <div class="create-header">
      <div class="container">
        <RouterLink to="/dashboard" class="back-link">← Mon tableau de bord</RouterLink>
        <h1>Publier une <span>annonce</span></h1>
        <p>Remplissez le formulaire ci-dessous pour mettre votre logement en ligne.</p>
      </div>
    </div>

    <div class="container create-body">
      <div class="create-grid">
        <!-- Form -->
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
              <textarea v-model="form.description" class="form-input" rows="5" placeholder="Décrivez votre logement : superficie, équipements, quartier..."></textarea>
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
                <input v-model="form.availableFrom" type="date" class="form-input" :min="today" />
              </div>
              <div class="form-group">
                <label class="form-label">Jusqu'au</label>
                <input v-model="form.availableTo" type="date" class="form-input" :min="form.availableFrom || today" />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h2 class="form-section-title">📸 Photos du logement</h2>
            <div class="form-group">
              <label class="form-label">Photos (max. 5)</label>
              <div
                class="dropzone"
                @dragover.prevent
                @drop.prevent="onDrop"
                @click="$refs.fileInput.click()"
              >
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  multiple
                  style="display:none"
                  @change="onFileChange"
                />
                <span v-if="!previews.length">
                  📂 Glissez vos photos ici ou <u>parcourir</u>
                </span>
                <div v-else class="preview-thumbnails">
                  <div
                    v-for="(src, i) in previews"
                    :key="i"
                    class="thumb-wrapper"
                  >
                    <img :src="src" class="thumb" />
                    <button type="button" class="thumb-remove" @click.stop="removeImage(i)">✕</button>
                  </div>
                </div>
              </div>
            <div class="char-count">{{ imageFiles.length }}/5 photo(s)</div>
          </div>
        </div>

          <button type="submit" class="btn btn-primary btn-lg btn-block" :disabled="loading">
            <span v-if="loading" class="spinner" style="width:18px;height:18px;border-width:2px"></span>
            <span v-else>Publier l'annonce ✈</span>
          </button>
        </form>

        <!-- Preview -->
        <aside class="preview-area">
          <h3 class="preview-title">Aperçu de votre annonce</h3>
          <div class="preview-card">
            <div class="preview-img">
              <img :src="previews[0] || placeholderImage" alt="preview" />
              <span class="badge badge-success preview-badge">Disponible</span>
            </div>
            <div class="preview-body">
              <div class="preview-city">📍 {{ form.city || 'Ville' }}</div>
              <div class="preview-name">{{ form.title || 'Titre de l\'annonce' }}</div>
              <div class="preview-desc" v-if="form.description">{{ truncate(form.description, 80) }}</div>
              <div class="preview-price">
                <strong>{{ form.pricePerNight || '—' }} €</strong> /nuit
              </div>
              <div v-if="previews.length" class="preview-image-list">
                <h4>Photos ajoutées</h4>
                <div class="preview-image-thumbs">
                  <img v-for="(src, index) in previews.slice(0, 4)" :key="index" :src="src" alt="photo preview" />
                </div>
              </div>
            </div>
          </div>
          <div class="tips">
            <h4>💡 Conseils</h4>
            <ul>
              <li>Un titre accrocheur augmente les vues de 60%</li>
              <li>Décrivez l'emplacement et les transports</li>
              <li>Mentionnez les équipements inclus</li>
              <li>Précisez les dates de disponibilité</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, inject, toRaw } from 'vue'
import { useRouter } from 'vue-router'
import { listingService } from '@/services/api'

const router = useRouter()
const showToast = inject('showToast')

const loading = ref(false)
const error = ref(null)
const success = ref(null)
const today = new Date().toISOString().split('T')[0]

const form = reactive({ title: '', description: '', city: '', pricePerNight: '', availableFrom: '', availableTo: '' })

const fileInput = ref(null)
const imageFiles = ref([])
const previews = ref([])
const placeholderImage = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=220&fit=crop'

function onFileChange(e) {
  addImages(Array.from(e.target.files))
  e.target.value = ''
}

function onDrop(e) {
  addImages(Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')))
}

function addImages(files) {
  const remaining = 5 - imageFiles.value.length
  const toAdd = files.slice(0, remaining)
  toAdd.forEach(file => {
    imageFiles.value.push(file)
    const reader = new FileReader()
    reader.onload = e => previews.value.push(e.target.result)
    reader.readAsDataURL(file)
  })
  if (files.length > remaining) {
    error.value = `Maximum 5 photos. ${files.length - remaining} fichier(s) ignoré(s).`
  }
}

function removeImage(index) {
  imageFiles.value.splice(index, 1)
  previews.value.splice(index, 1)
}

function truncate(str, n) { return str.length > n ? str.slice(0, n) + '…' : str }

async function handleSubmit() {
  loading.value = true; error.value = null; success.value = null
  try {
    const payload = new FormData()
    Object.entries(form).forEach(([key, val]) => {
      if (val !== '') payload.append(key, val)
    })
    imageFiles.value.forEach(file => payload.append('images', toRaw(file)))
    if (!payload.availableFrom) delete payload.availableFrom
    if (!payload.availableTo) delete payload.availableTo
    await listingService.create(payload)
    showToast?.('Annonce publiée avec succès ! 🎉', 'success')
    router.push('/dashboard')
  } catch (e) {
    error.value = e.response?.data?.error || 'Erreur lors de la création de l\'annonce'
  } finally { loading.value = false }
}
</script>

<style scoped>
@import "../assets/css/create-annonce.css";
</style>
