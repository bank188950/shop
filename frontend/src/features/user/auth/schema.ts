import { z } from 'zod'

export const registerFormSchema = z.object({
  name: z.string().trim().min(1, 'กรุณากรอกชื่อลูกค้า'),
  phone: z.string().min(1, 'กรุณากรอกเบอร์โทรศัพท์').regex(/^\d{10}$/, 'กรุณากรอกเบอร์โทรศัพท์ 10 หลัก'),
  lineId: z.string().trim(),
  locationId: z.string().min(1, 'กรุณาเลือกสถานที่ส่งของ'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
  confirmPassword: z.string().min(1, 'กรุณายืนยันรหัสผ่าน'),
}).refine((values) => values.password === values.confirmPassword, {
  path: ['confirmPassword'],
  message: 'รหัสผ่านไม่ตรงกัน',
})

export const loginFormSchema = z.object({
  phone: z.string().min(1, 'กรุณากรอกเบอร์โทรศัพท์').regex(/^\d{10}$/, 'กรุณากรอกเบอร์โทรศัพท์ 10 หลัก'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
})

export type RegisterFormValues = z.infer<typeof registerFormSchema>
export type LoginFormValues = z.infer<typeof loginFormSchema>
