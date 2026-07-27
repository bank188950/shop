import { z } from 'zod'

export const adminLoginFormSchema = z.object({
  username: z.string().trim().min(1, 'กรุณาระบุชื่อผู้ใช้'),
  password: z.string().min(1, 'กรุณาระบุรหัสผ่าน'),
  remember: z.boolean(),
})

export type AdminLoginFormValues = z.infer<typeof adminLoginFormSchema>
