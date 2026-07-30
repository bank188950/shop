import { z } from 'zod'

/** ต้องตรงกับที่ backend ตรวจใน user_order_slip_store และตรงกับที่ Slip2Go รับ คือ JPG กับ PNG เท่านั้น */
export const slipMaxFileSize = 5 * 1024 * 1024
export const slipAcceptedTypes = ['image/jpeg', 'image/png']

export const slipUploadSchema = z.object({
  slip: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, 'กรุณาแนบรูปสลิปการโอนเงิน')
    .refine((files) => !files[0] || slipAcceptedTypes.includes(files[0].type), 'รองรับเฉพาะไฟล์ JPG และ PNG')
    .refine((files) => !files[0] || files[0].size <= slipMaxFileSize, 'รูปสลิปต้องมีขนาดไม่เกิน 5 MB'),
})

export type SlipUploadValues = z.infer<typeof slipUploadSchema>
