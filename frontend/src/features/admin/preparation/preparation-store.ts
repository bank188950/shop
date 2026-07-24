import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { mockOrders, type AdminOrder, type DeliveryPeriod } from '@/features/admin/orders/order-data'

export type PreparationBatchStatus = 'preparing' | 'ready'

export type PreparationBatch = {
  id: string
  deliveryDate: string
  period: DeliveryPeriod
  orderIds: string[]
  status: PreparationBatchStatus
  createdAt: string
}

type PreparationStore = {
  orders: AdminOrder[]
  batches: PreparationBatch[]
  createBatch: (deliveryDate: string, period: DeliveryPeriod, orderIds: string[]) => void
  markBatchReady: (batchId: string) => void
  removeOrderFromBatch: (batchId: string, orderId: string) => void
  setOrdersStatus: (orderIds: string[], status: AdminOrder['status']) => void
}

const initialBatches: PreparationBatch[] = [
  { id: 'preparation-morning-1', deliveryDate: '2026-07-20', period: 'morning', orderIds: ['PO-200720-03'], status: 'preparing', createdAt: '20 ก.ค. 2569 07:45' },
  { id: 'preparation-afternoon-1', deliveryDate: '2026-07-20', period: 'afternoon', orderIds: ['PO-200720-04'], status: 'preparing', createdAt: '20 ก.ค. 2569 10:40' },
]

const legacyPreparationStatus = '\u0e40\u0e15\u0e23\u0e35\u0e22\u0e21\u0e02\u0e2d\u0e07'
const additionalReadyOrderIds = new Set(['PO-200720-13', 'PO-200720-19'])

function migratePreparationState(persistedState: unknown) {
  const state = persistedState as Pick<PreparationStore, 'orders' | 'batches'>
  const orders = state.orders.map((order) => ({
    ...order,
    status: additionalReadyOrderIds.has(order.id) || (order.deliveryDate === '2026-07-20' && order.period === 'morning' && order.location === 'จุดรับสินค้า B' && order.paymentStatus === 'จ่ายแล้ว')
      ? 'พร้อมส่ง'
      : String(order.status) === legacyPreparationStatus ? 'เตรียมสินค้า' : order.status,
  }))
  return {
    ...state,
    orders: [...orders, ...mockOrders.filter((order) => !orders.some((current) => current.id === order.id))],
  }
}

export const usePreparationStore = create<PreparationStore>()(persist((set) => ({
  orders: mockOrders,
  batches: initialBatches,
  createBatch: (deliveryDate, period, orderIds) => set((state) => {
    const selectedOrderIds = new Set(orderIds)
    const eligibleOrderIds = state.orders.filter((order) => (
      selectedOrderIds.has(order.id)
      && order.deliveryDate === deliveryDate
      && order.period === period
      && order.paymentStatus === 'จ่ายแล้ว'
      && order.status === 'รอตรวจสอบ'
    )).map((order) => order.id)
    if (!eligibleOrderIds.length) return state

    const includedOrderIds = new Set(eligibleOrderIds)
    return {
      orders: state.orders.map((order) => includedOrderIds.has(order.id) ? { ...order, status: 'เตรียมสินค้า' } : order),
      batches: [...state.batches, {
        id: `preparation-${Date.now()}`,
        deliveryDate,
        period,
        orderIds: eligibleOrderIds,
        status: 'preparing',
        createdAt: new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date()),
      }],
    }
  }),
  markBatchReady: (batchId) => set((state) => {
    const batch = state.batches.find((item) => item.id === batchId)
    if (!batch || batch.status === 'ready') return state
    const orderIds = new Set(batch.orderIds)
    return {
      orders: state.orders.map((order) => orderIds.has(order.id) ? { ...order, status: 'พร้อมส่ง' } : order),
      batches: state.batches.map((item) => item.id === batchId ? { ...item, status: 'ready' } : item),
    }
  }),
  removeOrderFromBatch: (batchId, orderId) => set((state) => {
    const batch = state.batches.find((item) => item.id === batchId)
    if (!batch || batch.status !== 'preparing' || !batch.orderIds.includes(orderId)) return state
    return {
      orders: state.orders.map((order) => order.id === orderId ? { ...order, status: 'รอตรวจสอบ' } : order),
      batches: state.batches.flatMap((item) => {
        if (item.id !== batchId) return [item]
        const orderIds = item.orderIds.filter((id) => id !== orderId)
        return orderIds.length ? [{ ...item, orderIds }] : []
      }),
    }
  }),
  setOrdersStatus: (orderIds, status) => set((state) => {
    const selectedOrderIds = new Set(orderIds)
    return { orders: state.orders.map((order) => selectedOrderIds.has(order.id) ? { ...order, status } : order) }
  }),
}), { name: 'lookchin-admin-preparation-v2', version: 5, migrate: migratePreparationState }))
