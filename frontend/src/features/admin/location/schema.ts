import { z } from 'zod'

export const locationFormSchema = z.object({
  name: z.string().trim().min(1, 'กรุณาระบุชื่อสถานที่รับสินค้า'),
  isActive: z.boolean(),
})

export type LocationFormValues = z.infer<typeof locationFormSchema>
