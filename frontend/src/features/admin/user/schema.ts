import { z } from 'zod'

const userBaseSchema = z.object({ name: z.string().trim().min(1, 'กรุณาระบุชื่อลูกค้า'), phone: z.string().regex(/^\d{10}$/, 'กรุณาระบุเบอร์โทรศัพท์ 10 หลัก'), lineId: z.string(), locationId: z.number().int().positive('กรุณาเลือกจุดรับสินค้า').nullable().refine((value) => value !== null, 'กรุณาเลือกจุดรับสินค้า'), isActive: z.boolean(), password: z.string(), confirmPassword: z.string() })
export const createUserFormSchema = userBaseSchema.superRefine((values, context) => { if (!values.password) context.addIssue({ code: 'custom', path: ['password'], message: 'กรุณาระบุรหัสผ่าน' }); if (values.password !== values.confirmPassword) context.addIssue({ code: 'custom', path: ['confirmPassword'], message: 'ยืนยันรหัสผ่านไม่ตรงกัน' }) })
export const updateUserFormSchema = userBaseSchema.superRefine((values, context) => { if ((values.password || values.confirmPassword) && values.password !== values.confirmPassword) context.addIssue({ code: 'custom', path: ['confirmPassword'], message: 'ยืนยันรหัสผ่านไม่ตรงกัน' }) })
export type UserFormInput = z.input<typeof updateUserFormSchema>
export type UserFormValues = z.output<typeof updateUserFormSchema>
