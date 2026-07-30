import api from '@/lib/axios'

export type OrderStatus = 'pending_payment' | 'pending_review' | 'preparing' | 'ready_for_delivery' | 'delivered' | 'cancelled'
export type OrderPaymentStatus = 'pending' | 'paid' | 'rejected' | 'refunded'
export type DeliveryPeriod = 'morning' | 'afternoon'

export type UserOrderItem = {
  name: string
  unitName: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export type UserOrder = {
  id: number
  orderNumber: string
  /** payload ของ QR พร้อมเพย์ที่ backend สร้างจากบัญชีรับเงินใน settings เป็น null เมื่อชำระแล้วหรือยังไม่ได้ตั้งบัญชี */
  paymentQr: string | null
  orderedAt: string
  deliveryDate: string
  deliveryPeriod: DeliveryPeriod
  locationName: string
  orderStatus: OrderStatus
  paymentStatus: OrderPaymentStatus
  totalAmount: number
  userNote: string
  items: UserOrderItem[]
}

export type CreateOrderInput = {
  locationId: number
  deliveryPeriod: DeliveryPeriod
  items: { productId: number, quantity: number }[]
}

export async function getUserOrders() {
  const response = await api.get<{ data: UserOrder[] }>('/user/orders')
  return response.data.data
}

export async function createUserOrder(input: CreateOrderInput) {
  const body = new URLSearchParams({
    location_id: String(input.locationId),
    delivery_period: input.deliveryPeriod,
    items: JSON.stringify(input.items),
  })
  const response = await api.post<{ data: UserOrder }>('/user/orders', body)
  return response.data.data
}

export async function payUserOrder(orderId: number, slip: File) {
  const body = new FormData()
  body.append('slip', slip)
  const response = await api.post<{ data: UserOrder }>(`/user/orders/${orderId}/pay`, body)
  return response.data.data
}
