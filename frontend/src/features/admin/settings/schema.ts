import { z } from 'zod'

export const settingsFormSchema = z.object({
  morningCutoff: z.string().min(1, 'กรุณาระบุเวลาปิดรับรอบเช้า'),
  morningDelivery: z.string().min(1, 'กรุณาระบุเวลาจัดส่งรอบเช้า'),
  afternoonCutoff: z.string().min(1, 'กรุณาระบุเวลาปิดรับรอบบ่าย'),
  afternoonDelivery: z.string().min(1, 'กรุณาระบุเวลาจัดส่งรอบบ่าย'),
  noticeMessage: z.string(),
  isNoticePopupEnabled: z.boolean(),
  isBadgeNotificationEnabled: z.boolean(),
  advertisements: z.array(z.object({ text: z.string() })).max(3),
  isAdvertisementVisible: z.boolean(),
})

export type SettingsFormValues = z.infer<typeof settingsFormSchema>
