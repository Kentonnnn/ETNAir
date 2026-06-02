<template>
  <div class="map-container">
    <div v-if="geocoding" class="map-loading">
      <div class="spinner"></div>
      <span>Chargement de la carte...</span>
    </div>
    <LMap
      ref="mapRef"
      :zoom="zoom"
      :center="center"
      :use-global-leaflet="false"
      style="height: 100%; width: 100%"
      @ready="onMapReady"
      @update:zoom="onZoomChange"
    >
      <LTileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
        layer-type="base"
      />

      <!-- Clustered (city-level) markers — low zoom -->
      <template v-if="!showIndividual">
        <LMarker
          v-for="cluster in cityClusters"
          :key="`cluster-${cluster.city}`"
          :lat-lng="[cluster.lat, cluster.lng]"
          @click="zoomToCluster(cluster)"
        >
          <LIcon
            :icon-size="[44, 44]"
            :icon-anchor="[22, 22]"
            :class-name="'cluster-icon-wrap'"
          >
            <template #default>
              <div class="cluster-marker">{{ cluster.count }}</div>
            </template>
          </LIcon>
          <LPopup>
            <div class="cluster-popup">
              <strong>{{ cluster.city }}</strong>
              <span>{{ cluster.count }} annonce{{ cluster.count > 1 ? 's' : '' }}</span>
              <button class="popup-link" @click="zoomToCluster(cluster)">Zoomer ici →</button>
            </div>
          </LPopup>
        </LMarker>
      </template>

      <!-- Individual markers — high zoom -->
      <template v-else>
        <LMarker
          v-for="listing in mappable"
          :key="listing.id"
          :lat-lng="[listing._lat, listing._lng]"
          @click="selectedId = listing.id"
        >
          <LIcon :icon-url="markerIcon" :icon-size="[32, 32]" :icon-anchor="[16, 32]" :popup-anchor="[0, -32]" />
          <LPopup>
            <div class="map-popup">
              <img :src="imgUrl(listing)" class="popup-img" :alt="listing.title" />
              <div class="popup-body">
                <div class="popup-city">📍 {{ listing.city }}</div>
                <div class="popup-title">{{ listing.title }}</div>
                <div class="popup-price">{{ formatPrice(listing.pricePerNight) }} €<span>/nuit</span></div>
                <a :href="`/annonces/${listing.id}`" class="popup-link">Voir l'annonce →</a>
              </div>
            </div>
          </LPopup>
        </LMarker>
      </template>
    </LMap>

    <div class="map-zoom-hint" v-if="!showIndividual">
      🔍 Zoomez pour voir les annonces individuelles
    </div>
    <div v-if="!geocoding && noCoords > 0" class="map-notice">
      {{ noCoords }} annonce{{ noCoords > 1 ? 's' : '' }} sans position disponible
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { LMap, LTileLayer, LMarker, LPopup, LIcon } from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  listings: { type: Array, default: () => [] }
})

const geocoding = ref(false)
const coordsCache = {}
const enriched = ref([])
const zoom = ref(5)
const center = ref([46.5, 2.5])

const markerIcon = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png'

const FALLBACK_IMGS = [
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=280&fit=crop',
]

function imgUrl(l) {
  if (l.images?.length) return `/api${l.images[0].url}`
  return FALLBACK_IMGS[l.id % FALLBACK_IMGS.length]
}
function formatPrice(p) { return Number(p).toLocaleString('fr-FR') }

const selectedId = ref(null)
const mapRef = ref(null)
const ZOOM_THRESHOLD = 8 // below = clusters, at/above = individual markers

const mappable = computed(() => enriched.value.filter(l => l._lat && l._lng))
const noCoords = computed(() => enriched.value.filter(l => !l._lat || !l._lng).length)
const showIndividual = computed(() => zoom.value >= ZOOM_THRESHOLD)

// Group listings by city → one marker per city with count
const cityClusters = computed(() => {
  const groups = {}
  for (const l of mappable.value) {
    if (!groups[l.city]) groups[l.city] = { city: l.city, count: 0, lat: 0, lng: 0 }
    groups[l.city].count++
    groups[l.city].lat += l._lat
    groups[l.city].lng += l._lng
  }
  return Object.values(groups).map(g => ({
    ...g,
    lat: g.lat / g.count,
    lng: g.lng / g.count,
  }))
})

function onMapReady(mapInstance) {
  // Keep ref to the leaflet instance for programmatic zoom
  mapRef.value = mapInstance
}

function onZoomChange(z) { zoom.value = z }

function zoomToCluster(cluster) {
  zoom.value = ZOOM_THRESHOLD + 2
  center.value = [cluster.lat, cluster.lng]
  if (mapRef.value?.setView) {
    mapRef.value.setView([cluster.lat, cluster.lng], ZOOM_THRESHOLD + 2, { animate: true })
  }
}

async function geocodeCity(city) {
  if (coordsCache[city]) return coordsCache[city]
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`
    const res = await fetch(url, { headers: { 'Accept-Language': 'fr' } })
    const data = await res.json()
    if (data.length > 0) {
      const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
      coordsCache[city] = coords
      return coords
    }
  } catch {}
  return null
}

async function enrichListings(listings) {
  geocoding.value = true
  const cities = [...new Set(listings.filter(l => !l.latitude && !l.longitude).map(l => l.city))]

  // Geocode unique cities in parallel (with small delay to respect Nominatim rate limit)
  for (let i = 0; i < cities.length; i++) {
    if (i > 0) await new Promise(r => setTimeout(r, 300))
    await geocodeCity(cities[i])
  }

  enriched.value = listings.map(l => {
    if (l.latitude && l.longitude) {
      return { ...l, _lat: l.latitude, _lng: l.longitude }
    }
    const coords = coordsCache[l.city]
    return coords ? { ...l, _lat: coords.lat, _lng: coords.lng } : { ...l, _lat: null, _lng: null }
  })

  const withCoords = enriched.value.filter(l => l._lat)
  if (withCoords.length > 0) {
    const avgLat = withCoords.reduce((s, l) => s + l._lat, 0) / withCoords.length
    const avgLng = withCoords.reduce((s, l) => s + l._lng, 0) / withCoords.length
    center.value = [avgLat, avgLng]
    zoom.value = withCoords.length === 1 ? 13 : 5
  }

  geocoding.value = false
}

watch(() => props.listings, (val) => { enrichListings(val) }, { immediate: true })
</script>

<style scoped>
.map-container { position: relative; height: 600px; border-radius: var(--radius); overflow: hidden; border: 1px solid var(--border); }
.map-loading { position: absolute; inset: 0; z-index: 999; background: rgba(255,255,255,.85); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; font-size: .95rem; color: var(--text-muted); }
.map-notice { position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,.65); color: #fff; padding: 6px 14px; border-radius: 20px; font-size: .8rem; z-index: 999; white-space: nowrap; }
.map-popup { width: 200px; }
.popup-img { width: 100%; height: 110px; object-fit: cover; border-radius: 6px; margin-bottom: 8px; }
.popup-body { padding: 0 2px; }
.popup-city { font-size: .75rem; color: #888; margin-bottom: 2px; }
.popup-title { font-weight: 700; font-size: .9rem; margin-bottom: 6px; line-height: 1.3; }
.popup-price { font-size: 1rem; font-weight: 800; color: #e74c3c; margin-bottom: 8px; }
.popup-price span { font-size: .75rem; font-weight: 400; color: #888; margin-left: 2px; }
.popup-link { display: block; text-align: center; background: #e74c3c; color: #fff; padding: 6px 0; border-radius: 6px; font-size: .82rem; text-decoration: none; font-weight: 600; }
.popup-link:hover { background: #c0392b; }

/* Zoom hint */
.map-zoom-hint {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,.75);
  color: #fff;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: .85rem;
  z-index: 999;
  backdrop-filter: blur(8px);
  pointer-events: none;
  animation: hint-fade 4s ease forwards;
}
@keyframes hint-fade {
  0%, 70% { opacity: 1; }
  100% { opacity: 0.5; }
}

/* Cluster markers — circular badge with count */
:global(.cluster-icon-wrap) {
  background: transparent !important;
  border: none !important;
}
.cluster-marker {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0458a0, #034080);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1rem;
  border: 3px solid #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,.3);
  cursor: pointer;
  transition: transform .15s ease;
}
.cluster-marker:hover { transform: scale(1.1); }

.cluster-popup {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  text-align: center;
}
.cluster-popup strong {
  font-size: 1rem;
  color: #1a1a2e;
}
.cluster-popup span {
  font-size: .85rem;
  color: #6b7280;
  margin-bottom: 8px;
}
.cluster-popup .popup-link {
  background: #0458a0;
  border: none;
  cursor: pointer;
  width: 100%;
}
.cluster-popup .popup-link:hover { background: #034080; }
</style>
