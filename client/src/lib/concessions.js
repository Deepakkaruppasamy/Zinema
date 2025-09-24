import api from './api'

const base = '/api/concessions'

export async function fetchConcessionItems(query = '') {
  const url = query ? `${base}/items?q=${encodeURIComponent(query)}` : `${base}/items`
  const { data } = await api.get(url)
  return data.items || []
}

export async function createConcessionOrder({ items, pickupTime, pickupLocation, notes, couponCode }) {
  const { data } = await api.post(`${base}/orders`, {
    items: items.map((i) => ({
      itemId: i.itemId || i.id || i._id,
      quantity: i.quantity || 1,
      selectedOptions: i.selectedOptions || []
    })),
    pickupTime,
    pickupLocation,
    notes,
    couponCode
  })
  return data.order
}

export async function fetchMyConcessionOrders() {
  const { data } = await api.get(`${base}/orders/me`)
  return data.orders || []
}

export async function createConcessionPaymentIntent(orderId) {
  const { data } = await api.post(`/api/booking-link/concessions/payment-intent`, { orderId })
  return data
}


