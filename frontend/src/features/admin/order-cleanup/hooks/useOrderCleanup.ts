import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { clearSlipFiles, getSlipCleanupCount, type CleanupTarget } from '@/api/admin/order-cleanup'

export const slipCleanupKeys = {
  count: (target: CleanupTarget) => ['admin', 'slip-cleanup', target.period, target.value] as const,
}

export function useSlipCleanupCount(target: CleanupTarget) {
  return useQuery({ queryKey: slipCleanupKeys.count(target), queryFn: () => getSlipCleanupCount(target) })
}

export function useClearSlipFiles() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (target: CleanupTarget) => clearSlipFiles(target),
    // ล้างแล้วจำนวนไฟล์ของทุกช่วงเวลาเปลี่ยนได้ จึงล้าง cache ทั้งกลุ่มไม่ใช่เฉพาะช่วงที่เพิ่งทำ
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'slip-cleanup'] }),
  })
}
