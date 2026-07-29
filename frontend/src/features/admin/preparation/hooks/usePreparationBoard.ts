import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createPreparationBatch,
  getPreparationBoard,
  markPreparationBatchReady,
  markPreparationOrdersDelivered,
  removePreparationBatchOrder,
  type PreparationFilters,
} from '@/api/admin/preparations'

const preparationKeys = {
  all: ['admin', 'preparations'] as const,
  board: (filters: PreparationFilters) => ['admin', 'preparations', 'board', filters] as const,
}

export function usePreparationBoard(filters: PreparationFilters) {
  // คงข้อมูลชุดเดิมไว้ระหว่างเปลี่ยนตัวกรอง กระดานจะได้ไม่กระพริบเป็นค่าว่าง
  return useQuery({ queryKey: preparationKeys.board(filters), queryFn: () => getPreparationBoard(filters), placeholderData: keepPreviousData })
}

/** ทุก mutation กระทบทั้งคิว รอบเตรียม และรอบจัดการสินค้า จึงล้าง cache ของหน้านี้ทั้งหมด */
function usePreparationMutation<TInput>(mutationFn: (input: TInput) => Promise<void>) {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn, onSuccess: () => queryClient.invalidateQueries({ queryKey: preparationKeys.all }) })
}

export function useCreatePreparationBatch() {
  return usePreparationMutation(({ filters, orderIds }: { filters: PreparationFilters, orderIds: number[] }) => createPreparationBatch(filters, orderIds))
}

export function useMarkPreparationBatchReady() {
  return usePreparationMutation((batchId: number) => markPreparationBatchReady(batchId))
}

export function useRemovePreparationBatchOrder() {
  return usePreparationMutation(({ batchId, orderId }: { batchId: number, orderId: number }) => removePreparationBatchOrder(batchId, orderId))
}

export function useMarkPreparationOrdersDelivered() {
  return usePreparationMutation((orderIds: number[]) => markPreparationOrdersDelivered(orderIds))
}
