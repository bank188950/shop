import api from '@/lib/axios'

export type OrderStatus = 'pending_payment' | 'pending_review' | 'preparing' | 'ready_for_delivery' | 'delivered' | 'cancelled'
export type OrderPaymentStatus = 'pending' | 'paid' | 'rejected' | 'refunded'
export type DeliveryPeriod = 'morning' | 'afternoon'

export type CustomerOrderItem = {
  name: string
  unitName: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export type CustomerOrder = {
  id: number
  orderNumber: string
  orderedAt: string
  deliveryDate: string
  deliveryPeriod: DeliveryPeriod
  locationName: string
  orderStatus: OrderStatus
  paymentStatus: OrderPaymentStatus
  totalAmount: number
  customerNote: string
  items: CustomerOrderItem[]
}

export type CreateOrderInput = {
  locationId: number
  deliveryPeriod: DeliveryPeriod
  items: { productId: number, quantity: number }[]
}

export async function getCustomerOrders() {
  const response = await api.get<{ data: CustomerOrder[] }>('/user/orders')
  return response.data.data
}

export async function createCustomerOrder(input: CreateOrderInput) {
  const body = new URLSearchParams({
    location_id: String(input.locationId),
    delivery_period: input.deliveryPeriod,
    items: JSON.stringify(input.items),
  })
  const response = await api.post<{ data: CustomerOrder }>('/user/orders', body)
  return response.data.data
}

export async function payCustomerOrder(orderId: number) {
  const response = await api.post<{ data: CustomerOrder }>(`/user/orders/${orderId}/pay`)
  return response.data.data
}
