import api from '@/lib/axios'
import type { DeliveryPeriod, OrderPaymentStatus } from '@/api/user/orders'

export type RecentOrder = {
  id: number
  userName: string
  items: string[]
  deliveryPeriod: DeliveryPeriod
  orderedAt: string
  totalAmount: number
  paymentStatus: OrderPaymentStatus
}

export async function getRecentOrders() {
  const response = await api.get<{ data: RecentOrder[] }>('/user/recent-orders')
  return response.data.data
}
