import { z } from 'zod'

const requiredTime = (message: string) => z.string().min(1, message)

export const settingsFormSchema = z.object({
  morningOrderCutoff: requiredTime('กรุณาระบุเวลาปิดรับรอบเช้า'),
  morningDeliveryStart: requiredTime('กรุณาระบุเวลาเริ่มจัดส่งรอบเช้า'),
  morningDeliveryEnd: requiredTime('กรุณาระบุเวลาสิ้นสุดจัดส่งรอบเช้า'),
  afternoonOrderCutoff: requiredTime('กรุณาระบุเวลาปิดรับรอบบ่าย'),
  afternoonDeliveryStart: requiredTime('กรุณาระบุเวลาเริ่มจัดส่งรอบบ่าย'),
  afternoonDeliveryEnd: requiredTime('กรุณาระบุเวลาสิ้นสุดจัดส่งรอบบ่าย'),
  noticePopupMessage: z.string(),
  isNoticePopupEnabled: z.boolean(),
  advertisements: z.array(z.object({ message: z.string() })).max(3),
  isAdvertisementVisible: z.boolean(),
})

export type SettingsFormValues = z.infer<typeof settingsFormSchema>
