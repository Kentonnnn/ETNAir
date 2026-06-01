import { ref } from 'vue'

// Module-level reactive — safe to import in router (no pinia required)
export const voletPhase = ref('idle')
// idle → covering → covered → uncovering → idle

const DURATION = 650

export function coverPage() {
  voletPhase.value = 'covering'
  return new Promise(resolve => {
    setTimeout(() => {
      voletPhase.value = 'covered'
      resolve()
    }, DURATION)
  })
}

export function uncoverPage() {
  requestAnimationFrame(() => {
    voletPhase.value = 'uncovering'
    setTimeout(() => {
      voletPhase.value = 'idle'
    }, DURATION)
  })
}

/** Indique si le volet est actif (couvre l'écran ou en cours) */
export function isVoletActive() {
  return voletPhase.value !== 'idle'
}
