import { type FormEvent, useState } from 'react'
import { CircleUserRound, UserPlus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type FormErrors = Record<string, string>

const inputClassName = 'mt-1.5 h-12 border-[#b9cbbf] bg-white px-3 text-base text-ink placeholder:text-[#728077] focus-visible:border-brand focus-visible:ring-brand/25'
const actionButtonClassName = 'min-h-12 rounded-full bg-[#76503a] px-5 text-lg font-extrabold text-white hover:bg-[#5f3d2b]'

function getPasswordError(value: string) {
  if (!value) return 'กรุณากรอกรหัสผ่าน'
  if (value.length < 8) return 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'
  return ''
}

function getRequiredError(value: string, label: string) {
  return value.trim() ? '' : `กรุณากรอก${label}`
}

function getPhoneError(value: string) {
  const phoneNumber = value.replace(/\D/g, '')
  if (!phoneNumber) return 'กรุณากรอกเบอร์โทรศัพท์'
  if (!/^0\d{8,9}$/.test(phoneNumber)) return 'กรุณากรอกเบอร์โทรศัพท์ 9–10 หลัก'
  return ''
}

function fieldClassName(hasError: boolean) {
  return `${inputClassName}${hasError ? ' border-[#c84646] focus-visible:border-[#c84646] focus-visible:ring-[#c84646]/25' : ''}`
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <p id={id} className="mt-1.5 mb-0 text-sm font-semibold text-[#c84646]" role="alert">{message}</p> : null
}

function DialogCloseButton() {
  return <DialogClose asChild><Button type="button" variant="ghost" size="icon" className="absolute right-3 top-3 rounded-full text-muted hover:bg-[#e1f3e5] hover:text-brand" aria-label="ปิดหน้าต่าง"><X size={22} strokeWidth={2.5} aria-hidden="true" /></Button></DialogClose>
}

function RegisterForm() {
  const [errors, setErrors] = useState<FormErrors>({})
  const [location, setLocation] = useState('')

  const validate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const password = String(formData.get('password') ?? '')
    const confirmPassword = String(formData.get('confirmPassword') ?? '')
    const nextErrors: FormErrors = {}
    const fields = [
      ['phone', getPhoneError(String(formData.get('phone') ?? ''))],
      ['password', getPasswordError(password)],
      ['lineId', getRequiredError(String(formData.get('lineId') ?? ''), 'LINE ID')],
      ['customerName', getRequiredError(String(formData.get('customerName') ?? ''), 'ชื่อลูกค้า')],
      ['location', getRequiredError(location, 'สถานที่ส่งของ')],
    ]
    fields.forEach(([field, message]) => {
      if (message) nextErrors[field] = message
    })
    if (!confirmPassword) nextErrors.confirmPassword = 'กรุณายืนยันรหัสผ่าน'
    else if (password !== confirmPassword) nextErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน'
    setErrors(nextErrors)
  }

  return <form className="grid gap-4" noValidate onSubmit={validate}>
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor="register-customer-name" className="text-base font-bold text-ink">ชื่อลูกค้า</Label>
        <Input id="register-customer-name" name="customerName" autoComplete="name" aria-invalid={Boolean(errors.customerName)} aria-describedby={errors.customerName ? 'register-customer-name-error' : undefined} className={fieldClassName(Boolean(errors.customerName))} />
        <FieldError id="register-customer-name-error" message={errors.customerName} />
      </div>
      <div>
        <Label htmlFor="register-phone" className="text-base font-bold text-ink">เบอร์โทรศัพท์</Label>
        <Input id="register-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="0812345678" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'register-phone-error' : undefined} className={fieldClassName(Boolean(errors.phone))} />
        <FieldError id="register-phone-error" message={errors.phone} />
      </div>
      <div>
        <Label htmlFor="register-password" className="text-base font-bold text-ink">รหัสผ่าน</Label>
        <Input id="register-password" name="password" type="password" autoComplete="new-password" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'register-password-error' : undefined} className={fieldClassName(Boolean(errors.password))} />
        <FieldError id="register-password-error" message={errors.password} />
      </div>
      <div>
        <Label htmlFor="register-confirm-password" className="text-base font-bold text-ink">ยืนยันรหัสผ่าน</Label>
        <Input id="register-confirm-password" name="confirmPassword" type="password" autoComplete="new-password" aria-invalid={Boolean(errors.confirmPassword)} aria-describedby={errors.confirmPassword ? 'register-confirm-password-error' : undefined} className={fieldClassName(Boolean(errors.confirmPassword))} />
        <FieldError id="register-confirm-password-error" message={errors.confirmPassword} />
      </div>
      <div>
        <Label htmlFor="register-location" className="text-base font-bold text-ink">สถานที่ส่งของ</Label>
        <input type="hidden" name="location" value={location} />
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger id="register-location" aria-invalid={Boolean(errors.location)} aria-describedby={errors.location ? 'register-location-error' : undefined} className={fieldClassName(Boolean(errors.location))}>
            <SelectValue placeholder="เลือกสถานที่ส่งของ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pickup-a">จุดรับสินค้า A</SelectItem>
            <SelectItem value="pickup-b">จุดรับสินค้า B</SelectItem>
            <SelectItem value="pickup-c">จุดรับสินค้า C</SelectItem>
          </SelectContent>
        </Select>
        <FieldError id="register-location-error" message={errors.location} />
      </div>
      <div>
        <Label htmlFor="register-line-id" className="text-base font-bold text-ink">LINE ID</Label>
        <Input id="register-line-id" name="lineId" placeholder="ชื่อผู้ใช้ LINE" aria-invalid={Boolean(errors.lineId)} aria-describedby={errors.lineId ? 'register-line-id-error' : undefined} className={fieldClassName(Boolean(errors.lineId))} />
        <FieldError id="register-line-id-error" message={errors.lineId} />
      </div>
    </div>
    <Button type="submit" className={actionButtonClassName}>สมัครสมาชิก</Button>
  </form>
}

function LoginForm() {
  const [errors, setErrors] = useState<FormErrors>({})

  const validate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const nextErrors: FormErrors = {}
    const phoneError = getPhoneError(String(formData.get('phone') ?? ''))
    const passwordError = getPasswordError(String(formData.get('password') ?? ''))
    if (phoneError) nextErrors.phone = phoneError
    if (passwordError) nextErrors.password = passwordError
    setErrors(nextErrors)
  }

  return <form className="grid gap-4" noValidate onSubmit={validate}>
    <div>
      <Label htmlFor="login-phone" className="text-base font-bold text-ink">เบอร์โทรศัพท์</Label>
      <Input id="login-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="0812345678" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'login-phone-error' : undefined} className={fieldClassName(Boolean(errors.phone))} />
      <FieldError id="login-phone-error" message={errors.phone} />
    </div>
    <div>
      <Label htmlFor="login-password" className="text-base font-bold text-ink">รหัสผ่าน</Label>
      <Input id="login-password" name="password" type="password" autoComplete="current-password" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'login-password-error' : undefined} className={fieldClassName(Boolean(errors.password))} />
      <FieldError id="login-password-error" message={errors.password} />
    </div>
    <Button type="submit" className={actionButtonClassName}>เข้าสู่ระบบ</Button>
  </form>
}

export function AuthDialogs() {
  return <>
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" className="min-h-11 rounded-full bg-[#76503a] px-5 py-2.5 text-lg font-extrabold text-white shadow-md shadow-[#76503a]/20 hover:bg-[#5f3d2b] max-md:px-3.5 max-sm:size-11 max-sm:px-0" aria-label="สมัครสมาชิก"><UserPlus size={18} aria-hidden="true" /><span className="max-sm:hidden">สมัครสมาชิก</span></Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl border-[#b9cbbf] bg-canvas p-5 shadow-2xl sm:max-w-[560px] sm:p-6">
        <DialogCloseButton />
        <DialogHeader className="pr-10 text-left">
          <DialogTitle className="font-heading text-2xl text-ink">สมัครสมาชิก</DialogTitle>
          <DialogDescription className="text-base leading-relaxed text-muted">กรอกข้อมูลเพื่อสร้างบัญชีสำหรับสั่งซื้อและติดตามรายการได้สะดวกขึ้น</DialogDescription>
        </DialogHeader>
        <RegisterForm />
      </DialogContent>
    </Dialog>

    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" className="min-h-11 rounded-full bg-[#76503a] px-5 py-2.5 text-lg font-extrabold text-white shadow-md shadow-[#76503a]/20 hover:bg-[#5f3d2b] max-md:px-3.5 max-sm:size-11 max-sm:px-0" aria-label="เข้าสู่ระบบ"><CircleUserRound size={18} aria-hidden="true" /><span className="max-sm:hidden">เข้าสู่ระบบ</span></Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl border-[#b9cbbf] bg-canvas p-5 shadow-2xl sm:max-w-[460px] sm:p-6">
        <DialogCloseButton />
        <DialogHeader className="pr-10 text-left">
          <DialogTitle className="font-heading text-2xl text-ink">เข้าสู่ระบบ</DialogTitle>
          <DialogDescription className="text-base leading-relaxed text-muted">เข้าสู่ระบบเพื่อจัดการข้อมูลและติดตามคำสั่งซื้อของคุณ</DialogDescription>
        </DialogHeader>
        <LoginForm />
      </DialogContent>
    </Dialog>
  </>
}
