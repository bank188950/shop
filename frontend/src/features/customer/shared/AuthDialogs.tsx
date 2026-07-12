import { type FormEvent, useState } from 'react'
import { CircleUserRound, UserPlus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type FormErrors = Record<string, string>

const inputClassName = 'mt-1.5 h-12 border-[#b9cbbf] bg-white px-3 text-base text-ink placeholder:text-[#728077] focus-visible:border-brand focus-visible:ring-brand/25'
const actionButtonClassName = 'min-h-12 rounded-full bg-[#76503a] px-5 text-lg font-extrabold text-white hover:bg-[#5f3d2b]'

function getEmailError(value: string) {
  if (!value) return 'กรุณากรอกอีเมล'
  if (!/^\S+@\S+\.\S+$/.test(value)) return 'กรุณากรอกอีเมลให้ถูกต้อง'
  return ''
}

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

function GoogleMark() {
  return <svg width="24" height="24" viewBox="0 0 18 18" className="shrink-0" shapeRendering="geometricPrecision" aria-hidden="true">
    <path fill="#EA4335" d="M17.64 9.205c0-.638-.057-1.251-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.797 2.716v2.258h2.909c1.704-1.569 2.688-3.878 2.688-6.614Z" />
    <path fill="#4285F4" d="M9 18c2.43 0 4.468-.806 5.957-2.181l-2.909-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.71H.956v2.332A9 9 0 0 0 9 18Z" />
    <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.956A9 9 0 0 0 0 9c0 1.452.348 2.827.956 4.042l3.008-2.332Z" />
    <path fill="#34A853" d="M9 3.58c1.321 0 2.508.455 3.44 1.346l2.581-2.581C13.464.892 11.426 0 9 0A9 9 0 0 0 .956 4.958l3.008 2.332C4.672 5.164 6.656 3.58 9 3.58Z" />
  </svg>
}

function RegisterForm() {
  const [errors, setErrors] = useState<FormErrors>({})

  const validate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const password = String(formData.get('password') ?? '')
    const confirmPassword = String(formData.get('confirmPassword') ?? '')
    const nextErrors: FormErrors = {}
    const fields = [
      ['email', getEmailError(String(formData.get('email') ?? ''))],
      ['password', getPasswordError(password)],
      ['firstName', getRequiredError(String(formData.get('firstName') ?? ''), 'ชื่อจริง')],
      ['nickname', getRequiredError(String(formData.get('nickname') ?? ''), 'ชื่อเล่น')],
      ['phone', getPhoneError(String(formData.get('phone') ?? ''))],
      ['lineId', getRequiredError(String(formData.get('lineId') ?? ''), 'LINE ID')],
    ]
    fields.forEach(([field, message]) => {
      if (message) nextErrors[field] = message
    })
    if (!confirmPassword) nextErrors.confirmPassword = 'กรุณายืนยันรหัสผ่าน'
    else if (password !== confirmPassword) nextErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน'
    setErrors(nextErrors)
  }

  return <form className="grid gap-4" noValidate onSubmit={validate}>
    <div>
      <Label htmlFor="register-email" className="text-base font-bold text-ink">อีเมล</Label>
      <Input id="register-email" name="email" type="email" autoComplete="email" placeholder="name@example.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'register-email-error' : undefined} className={fieldClassName(Boolean(errors.email))} />
      <FieldError id="register-email-error" message={errors.email} />
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
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
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor="register-first-name" className="text-base font-bold text-ink">ชื่อจริง</Label>
        <Input id="register-first-name" name="firstName" autoComplete="given-name" aria-invalid={Boolean(errors.firstName)} aria-describedby={errors.firstName ? 'register-first-name-error' : undefined} className={fieldClassName(Boolean(errors.firstName))} />
        <FieldError id="register-first-name-error" message={errors.firstName} />
      </div>
      <div>
        <Label htmlFor="register-nickname" className="text-base font-bold text-ink">ชื่อเล่น</Label>
        <Input id="register-nickname" name="nickname" aria-invalid={Boolean(errors.nickname)} aria-describedby={errors.nickname ? 'register-nickname-error' : undefined} className={fieldClassName(Boolean(errors.nickname))} />
        <FieldError id="register-nickname-error" message={errors.nickname} />
      </div>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor="register-phone" className="text-base font-bold text-ink">เบอร์โทรศัพท์</Label>
        <Input id="register-phone" name="phone" type="tel" autoComplete="tel" placeholder="081-234-5678" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'register-phone-error' : undefined} className={fieldClassName(Boolean(errors.phone))} />
        <FieldError id="register-phone-error" message={errors.phone} />
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
    const emailError = getEmailError(String(formData.get('email') ?? ''))
    const passwordError = getPasswordError(String(formData.get('password') ?? ''))
    if (emailError) nextErrors.email = emailError
    if (passwordError) nextErrors.password = passwordError
    setErrors(nextErrors)
  }

  return <form className="grid gap-4" noValidate onSubmit={validate}>
    <div>
      <Label htmlFor="login-email" className="text-base font-bold text-ink">อีเมล</Label>
      <Input id="login-email" name="email" type="email" autoComplete="email" placeholder="name@example.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'login-email-error' : undefined} className={fieldClassName(Boolean(errors.email))} />
      <FieldError id="login-email-error" message={errors.email} />
    </div>
    <div>
      <Label htmlFor="login-password" className="text-base font-bold text-ink">รหัสผ่าน</Label>
      <Input id="login-password" name="password" type="password" autoComplete="current-password" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'login-password-error' : undefined} className={fieldClassName(Boolean(errors.password))} />
      <FieldError id="login-password-error" message={errors.password} />
    </div>
    <Button type="submit" className={actionButtonClassName}>เข้าสู่ระบบ</Button>
    <div className="relative py-1 text-center before:absolute before:inset-x-0 before:top-1/2 before:border-t before:border-[#d6e1d7]">
      <span className="relative bg-canvas px-3 text-sm font-semibold text-muted">หรือ</span>
    </div>
    <Button type="button" variant="outline" className="min-h-11 rounded-full border border-[#5f6368] bg-white px-5 text-base font-semibold text-[#202124] shadow-none hover:border-[#202124] hover:bg-[#f8fafd] hover:text-[#202124]"><GoogleMark />เข้าสู่ระบบด้วย Google</Button>
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
