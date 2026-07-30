import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AppRouter } from '@/app/router'
import { adminBadgeCountsKey } from '@/features/admin/dashboard/hooks/useDashboard'
import '@/styles/index.css'
import '@/styles/index-admin.css'

// ตัวเลข badge บนแถบผู้ดูแลเปลี่ยนได้จากหลายหน้า ทั้งอนุมัติออเดอร์ แก้สต็อก และกระดานเตรียมสินค้า
// จึงรีเฟรชจากจุดเดียวเมื่อ mutation ใดสำเร็จ จะได้ไม่ต้องไล่เพิ่มทีละจุดแล้วตกหล่นจนตัวเลขค้าง
const queryClient: QueryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminBadgeCountsKey }),
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
)
