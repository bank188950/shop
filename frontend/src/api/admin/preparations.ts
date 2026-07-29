import api from '@/lib/axios'
import type { AdminDeliveryPeriod, AdminOrderStatus } from '@/api/admin/orders'

export type PreparationItem = {
  name: string
  unitName: string
  quantity: number
  pieces: number
}

export type PreparationOrder = {
  id: number
  orderNumber: string
  userName: string
  locationId: number
  locationName: string
  orderStatus: AdminOrderStatus
  totalAmount: number
  items: PreparationItem[]
}

export type PreparationBatch = {
  id: number
  createdAt: string
  orders: PreparationOrder[]
}

export type PreparationDeliveryGroup = {
  locationId: number
  locationName: string
  orders: PreparationOrder[]
}

export type PreparationLocation = { id: number, name: string }

export type PreparationBoard = {
  queue: PreparationOrder[]
  batches: PreparationBatch[]
  deliveryGroups: PreparationDeliveryGroup[]
  locations: PreparationLocation[]
}

export type PreparationFilters = {
  deliveryDate: string
  deliveryPeriod: AdminDeliveryPeriod
  locationId: 'all' | number
}

function filterParams(filters: PreparationFilters) {
  const params: Record<string, string> = { delivery_date: filters.deliveryDate, delivery_period: filters.deliveryPeriod }
  if (filters.locationId !== 'all') params.location_id = String(filters.locationId)
  return params
}

export async function getPreparationBoard(filters: PreparationFilters) {
  const response = await api.get<PreparationBoard>('/admin/preparations', { params: filterParams(filters) })
  return response.data
}

export async function createPreparationBatch(filters: PreparationFilters, orderIds: number[]) {
  const body = new URLSearchParams({ ...filterParams(filters), order_ids: JSON.stringify(orderIds) })
  await api.post('/admin/preparations', body)
}

export async function markPreparationBatchReady(batchId: number) {
  await api.post(`/admin/preparations/${batchId}/ready`)
}

export async function removePreparationBatchOrder(batchId: number, orderId: number) {
  await api.delete(`/admin/preparations/${batchId}/orders/${orderId}`)
}

export async function markPreparationOrdersDelivered(orderIds: number[]) {
  const body = new URLSearchParams({ order_ids: JSON.stringify(orderIds) })
  await api.post('/admin/preparations/delivered', body)
}
