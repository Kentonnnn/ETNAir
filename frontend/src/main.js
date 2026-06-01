import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)

// Prefetch the Lottie JSON so the animation is cached before transitions occur.
// This is non-blocking and will not prevent the app from starting.
try {
	if (typeof fetch === 'function') {
		fetch('/travel-loader.json', { cache: 'force-cache' })
			.then(res => { if (res.ok) return res.json(); throw new Error('not-ok') })
			.then(json => { window.__LOTTIE_TRAVEL_JSON = json })
			.catch(() => { /* ignore prefetch errors */ })
	}
} catch (e) { /* ignore */ }

app.mount('#app')
