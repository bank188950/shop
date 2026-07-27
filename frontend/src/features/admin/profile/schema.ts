import { z } from 'zod'

const avatarSchema = z.instanceof(File)
  .refine((file) => ['image/jpeg', 'image/png'].includes(file.type), 'รองรับเฉพาะรูป JPG และ PNG')
  .refine((file) => file.size <= 5 * 1024 * 1024, 'รูปผู้ดูแลระบบต้องมีขนาดไม่เกิน 5 MB')

export const adminProfileFormSchema = z.object({
  name: z.string().trim().min(1, 'กรุณาระบุชื่อผู้ดูแลระบบ').max(150, 'ชื่อผู้ดูแลระบบยาวเกิน 150 ตัวอักษร'),
  avatar: avatarSchema.nullable(),
})

export type AdminProfileFormValues = z.infer<typeof adminProfileFormSchema>
