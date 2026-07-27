import { z } from 'zod'

const bannerImageSchema = z.instanceof(File, { message: 'กรุณาเลือกรูปแบนเนอร์' })
  .refine((file) => ['image/jpeg', 'image/png'].includes(file.type), 'รองรับเฉพาะรูป JPG หรือ PNG')
  .refine((file) => file.size <= 5 * 1024 * 1024, 'รูปแบนเนอร์ต้องมีขนาดไม่เกิน 5 MB')

const bannerBaseSchema = z.object({
  title: z.string().trim().min(1, 'กรุณาระบุหัวข้อแบนเนอร์'),
  isActive: z.boolean(),
})

export const createBannerFormSchema = bannerBaseSchema.extend({ image: bannerImageSchema })
export const updateBannerFormSchema = bannerBaseSchema.extend({ image: bannerImageSchema.nullable() })

export type BannerFormValues = z.infer<typeof updateBannerFormSchema>
