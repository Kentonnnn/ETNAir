import { ref } from 'vue'
import { defineStore } from 'pinia'
import { bookingService } from '@/services/api'

export const useBookingsStore = defineStore('bookings', () => {
  const myBookings   = ref([])
  const received     = ref([])
  const loading      = ref(false)

  async function loadMine() {
    loading.value = true
    try {
      const { data } = await bookingService.getMine()
      myBookings.value = data.bookings
    } finally { loading.value = false }
  }

  async function loadReceived() {
    loading.value = true
    try {
      const { data } = await bookingService.getReceived()
      received.value = data.bookings
    } finally { loading.value = false }
  }

  async function confirm(id) {
    const { data } = await bookingService.confirm(id)
    const i = received.value.findIndex(b => b.id === id)
    if (i !== -1) received.value[i] = data.booking
  }

  async function cancel(id) {
    const { data } = await bookingService.cancel(id)
    for (const list of [myBookings.value, received.value]) {
      const i = list.findIndex(b => b.id === id)
      if (i !== -1) list[i] = data.booking
    }
  }

  function reset() { myBookings.value = []; received.value = [] }

  return { myBookings, received, loading, loadMine, loadReceived, confirm, cancel, reset }
})
