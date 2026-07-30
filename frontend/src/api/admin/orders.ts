import api from '@/lib/axios'

export type AdminOrderStatus = 'pending_payment' | 'pending_review' | 'preparing' | 'ready_for_delivery' | 'delivered' | 'cancelled'
export type AdminPaymentStatus = 'pending' | 'paid' | 'rejected' | 'refunded'
export type AdminDeliveryPeriod = 'morning' | 'afternoon'

export type AdminOrderItem = {
  name: string
  unitName: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export type AdminOrder = {
  id: number
  orderNumber: string
  orderedAt: string
  deliveryDate: string
  deliveryPeriod: AdminDeliveryPeriod
  locationId: number
  locationName: string
  userName: string
  phone: string
  lineId: string
  orderStatus: AdminOrderStatus
  paymentStatus: AdminPaymentStatus
  totalAmount: number
  userNote: string
  hasSlip: boolean
  items: AdminOrderItem[]
}

/** รูปสลิปเสิร์ฟผ่าน API ที่ตรวจสิทธิ์แอดมิน จึงต่อ URL จาก baseURL เดียวกับ request อื่น */
export function adminOrderSlipUrl(orderId: number) {
  return `${api.defaults.baseURL ?? '/api'}/admin/orders/${orderId}/slip`
}

export type AdminOrderFilters = {
  deliveryDate: string
  deliveryPeriod: 'all' | AdminDeliveryPeriod
  locationId: 'all' | number
  orderStatus: 'all' | AdminOrderStatus
  query: string
}

export type AdminOrderLocation = { id: number, name: string }
export type AdminOrderList = { orders: AdminOrder[], locations: AdminOrderLocation[] }
export type AdminOrderStatusInput = { orderStatus: AdminOrderStatus, paymentStatus: 'pending' | 'paid' }

export async function getAdminOrders(filters: AdminOrderFilters) {
  const params: Record<string, string> = { delivery_date: filters.deliveryDate }
  if (filters.deliveryPeriod !== 'all') params.delivery_period = filters.deliveryPeriod
  if (filters.locationId !== 'all') params.location_id = String(filters.locationId)
  if (filters.orderStatus !== 'all') params.order_status = filters.orderStatus
  if (filters.query.trim()) params.q = filters.query.trim()

  const response = await api.get<{ data: AdminOrder[], locations: AdminOrderLocation[] }>('/admin/orders', { params })
  return { orders: response.data.data, locations: response.data.locations } satisfies AdminOrderList
}

export async function getAdminOrder(orderId: number) {
  const response = await api.get<{ data: AdminOrder }>(`/admin/orders/${orderId}`)
  return response.data.data
}

export async function updateAdminOrdersStatus(orderIds: number[], orderStatus: AdminOrderStatus) {
  const body = new URLSearchParams({ order_ids: JSON.stringify(orderIds), order_status: orderStatus })
  await api.post('/admin/orders/status', body)
}

export async function updateAdminOrderStatus(orderId: number, input: AdminOrderStatusInput) {
  const body = new URLSearchParams({ order_status: input.orderStatus, payment_status: input.paymentStatus })
  const response = await api.post<{ data: AdminOrder }>(`/admin/orders/${orderId}`, body)
  return response.data.data
}
