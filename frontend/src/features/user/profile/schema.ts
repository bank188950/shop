import { z } from 'zod'

export const profileFormSchema = z.object({
  name: z.string().trim().min(1, 'กรุณากรอกชื่อลูกค้า'),
  phone: z.string().min(1, 'กรุณากรอกเบอร์โทรศัพท์').regex(/^\d{10}$/, 'กรุณากรอกเบอร์โทรศัพท์ 10 หลัก'),
  lineId: z.string().trim(),
  locationId: z.string().min(1, 'กรุณาเลือกสถานที่ส่งของ'),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>
