import { useState } from 'react'
import { CircleUserRound, LogOut, UserCog, UserPlus, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCustomerAuth, useCustomerLogin, useCustomerLogout, useCustomerRegister } from '@/features/user/auth/hooks/useCustomerAuth'
import { useCustomerLocations } from '@/features/user/shared/hooks/useCustomerLocations'
import { loginFormSchema, registerFormSchema, type LoginFormValues, type RegisterFormValues } from '@/features/user/auth/schema'

const inputClassName = 'mt-1.5 h-12 border-[#b9cbbf] bg-white px-3 text-base text-ink placeholder:text-[#728077] focus-visible:border-brand focus-visible:ring-brand/25'
const actionButtonClassName = 'min-h-12 rounded-full bg-[#76503a] px-5 text-lg font-extrabold text-white hover:bg-[#5f3d2b]'
const triggerButtonClassName = 'min-h-11 rounded-full bg-[#76503a] px-5 py-2.5 text-lg font-extrabold text-white shadow-md shadow-[#76503a]/20 hover:bg-[#5f3d2b] max-md:px-3.5 max-sm:size-11 max-sm:px-0'

function fieldClassName(hasError: boolean) {
  return `${inputClassName}${hasError ? ' border-[#c84646] focus-visible:border-[#c84646] focus-visible:ring-[#c84646]/25' : ''}`
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <p id={id} className="mt-1.5 mb-0 text-sm font-semibold text-[#c84646]" role="alert">{message}</p> : null
}

function FormError({ message }: { message?: string }) {
  return message ? <p className="m-0 mt-8 rounded-xl bg-[#fbeaea] px-3 py-3.5 text-center text-base font-semibold text-[#c84646]" role="alert">{message}</p> : null
}

function DialogCloseButton() {
  return <DialogClose asChild><Button type="button" variant="ghost" size="icon" className="absolute right-3 top-3 rounded-full text-muted hover:bg-[#e1f3e5] hover:text-brand" aria-label="ปิดหน้าต่าง"><X size={22} strokeWidth={2.5} aria-hidden="true" /></Button></DialogClose>
}

function RegisterForm({ registerMutation, onSuccess }: { registerMutation: ReturnType<typeof useCustomerRegister>; onSuccess: () => void }) {
  const locationsQuery = useCustomerLocations()
  const { register, control, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { name: '', phone: '', lineId: '', locationId: '', password: '', confirmPassword: '' },
  })

  async function submit(values: RegisterFormValues) {
    try {
      await registerMutation.mutateAsync(values)
      onSuccess()
    } catch {
      // แสดงข้อความจาก mutation ไว้บนสุดของ modal
    }
  }

  return <form className="grid gap-4" noValidate onSubmit={handleSubmit(submit)}>
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor="register-customer-name" className="text-base font-bold text-ink">ชื่อลูกค้า</Label>
        <Input id="register-customer-name" autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'register-customer-name-error' : undefined} className={fieldClassName(Boolean(errors.name))} {...register('name')} />
        <FieldError id="register-customer-name-error" message={errors.name?.message} />
      </div>
      <div>
        <Label htmlFor="register-phone" className="text-base font-bold text-ink">เบอร์โทรศัพท์</Label>
        <Input id="register-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="พิมพ์เฉพาะตัวเลข 10 หลัก" maxLength={10} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'register-phone-error' : undefined} className={fieldClassName(Boolean(errors.phone))} {...register('phone')} />
        <FieldError id="register-phone-error" message={errors.phone?.message} />
      </div>
      <div>
        <Label htmlFor="register-password" className="text-base font-bold text-ink">รหัสผ่าน</Label>
        <Input id="register-password" type="password" autoComplete="new-password" maxLength={10} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'register-password-error' : undefined} className={fieldClassName(Boolean(errors.password))} {...register('password')} />
        <FieldError id="register-password-error" message={errors.password?.message} />
      </div>
      <div>
        <Label htmlFor="register-confirm-password" className="text-base font-bold text-ink">ยืนยันรหัสผ่าน</Label>
        <Input id="register-confirm-password" type="password" autoComplete="new-password" maxLength={10} aria-invalid={Boolean(errors.confirmPassword)} aria-describedby={errors.confirmPassword ? 'register-confirm-password-error' : undefined} className={fieldClassName(Boolean(errors.confirmPassword))} {...register('confirmPassword')} />
        <FieldError id="register-confirm-password-error" message={errors.confirmPassword?.message} />
      </div>
      <div>
        <Label htmlFor="register-location" className="text-base font-bold text-ink">สถานที่ส่งของ</Label>
        <Controller
          control={control}
          name="locationId"
          render={({ field }) => <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger id="register-location" ref={field.ref} onBlur={field.onBlur} aria-invalid={Boolean(errors.locationId)} aria-describedby={errors.locationId ? 'register-location-error' : undefined} className={fieldClassName(Boolean(errors.locationId))}>
              <SelectValue placeholder={locationsQuery.isLoading ? 'กำลังโหลดสถานที่ส่งของ' : 'เลือกสถานที่ส่งของ'} />
            </SelectTrigger>
            <SelectContent>
              {(locationsQuery.data ?? []).map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}
            </SelectContent>
          </Select>}
        />
        <FieldError id="register-location-error" message={errors.locationId?.message} />
      </div>
      <div>
        <Label htmlFor="register-line-id" className="text-base font-bold text-ink">LINE ID <span className="text-sm font-semibold text-muted">(ไม่บังคับ)</span></Label>
        <Input id="register-line-id" placeholder="ชื่อแอคเคาท์ LINE" aria-invalid={Boolean(errors.lineId)} aria-describedby={errors.lineId ? 'register-line-id-error' : undefined} className={fieldClassName(Boolean(errors.lineId))} {...register('lineId')} />
        <FieldError id="register-line-id-error" message={errors.lineId?.message} />
      </div>
    </div>
    <Button type="submit" className={actionButtonClassName} disabled={registerMutation.isPending} aria-busy={registerMutation.isPending}>{registerMutation.isPending ? 'กำลังสมัครสมาชิก' : 'สมัครสมาชิก'}</Button>
  </form>
}

function LoginForm({ loginMutation, onSuccess }: { loginMutation: ReturnType<typeof useCustomerLogin>; onSuccess: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { phone: '', password: '' },
  })

  async function submit(values: LoginFormValues) {
    try {
      await loginMutation.mutateAsync(values)
      onSuccess()
    } catch {
      // แสดงข้อความจาก mutation ไว้บนสุดของ modal
    }
  }

  return <form className="grid gap-4" noValidate onSubmit={handleSubmit(submit)}>
    <div>
      <Label htmlFor="login-phone" className="text-base font-bold text-ink">เบอร์โทรศัพท์</Label>
      <Input id="login-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="พิมพ์เฉพาะตัวเลข 10 หลัก" maxLength={10} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'login-phone-error' : undefined} className={fieldClassName(Boolean(errors.phone))} {...register('phone')} />
      <FieldError id="login-phone-error" message={errors.phone?.message} />
    </div>
    <div>
      <Label htmlFor="login-password" className="text-base font-bold text-ink">รหัสผ่าน</Label>
      <Input id="login-password" type="password" autoComplete="current-password" maxLength={10} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'login-password-error' : undefined} className={fieldClassName(Boolean(errors.password))} {...register('password')} />
      <FieldError id="login-password-error" message={errors.password?.message} />
    </div>
    <Button type="submit" className={actionButtonClassName} disabled={loginMutation.isPending} aria-busy={loginMutation.isPending}>{loginMutation.isPending ? 'กำลังเข้าสู่ระบบ' : 'เข้าสู่ระบบ'}</Button>
  </form>
}

export function AuthDialogs() {
  const [openDialog, setOpenDialog] = useState<'register' | 'login' | null>(null)
  const authQuery = useCustomerAuth()
  const registerMutation = useCustomerRegister()
  const loginMutation = useCustomerLogin()
  const logoutMutation = useCustomerLogout()

  if (authQuery.isLoading) return null

  if (authQuery.data) return <div className="flex items-center gap-2">
    <span className="grid leading-tight max-sm:hidden">
      <small className="text-sm font-semibold text-muted">สวัสดี</small>
      <strong className="max-w-40 truncate text-base font-extrabold text-ink">{authQuery.data.name}</strong>
    </span>
    <Link to="/my-profile" className={`inline-flex items-center justify-center gap-2 no-underline ${triggerButtonClassName}`} aria-label="จัดการ">
      <UserCog size={18} aria-hidden="true" /><span className="max-sm:hidden">จัดการ</span>
    </Link>
    <Button type="button" onClick={() => logoutMutation.mutate()} disabled={logoutMutation.isPending} aria-busy={logoutMutation.isPending} className={triggerButtonClassName} aria-label="ออกจากระบบ">
      <LogOut size={18} aria-hidden="true" /><span className="max-sm:hidden">ออกจากระบบ</span>
    </Button>
  </div>

  return <>
    <Dialog open={openDialog === 'register'} onOpenChange={(open) => { setOpenDialog(open ? 'register' : null); if (!open) registerMutation.reset() }}>
      <DialogTrigger asChild>
        <Button type="button" className={triggerButtonClassName} aria-label="สมัครสมาชิก"><UserPlus size={18} aria-hidden="true" /><span className="max-sm:hidden">สมัครสมาชิก</span></Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl border-[#b9cbbf] bg-canvas p-5 shadow-2xl sm:max-w-[560px] sm:p-6">
        <DialogCloseButton />
        <FormError message={registerMutation.isError ? registerMutation.error.message : undefined} />
        <DialogHeader className="pr-10 text-left">
          <DialogTitle className="font-heading text-2xl text-ink">สมัครสมาชิก</DialogTitle>
          <DialogDescription className="text-base leading-relaxed text-muted">กรอกข้อมูลเพื่อสร้างบัญชีสำหรับสั่งซื้อและติดตามรายการได้สะดวกขึ้น</DialogDescription>
        </DialogHeader>
        <RegisterForm registerMutation={registerMutation} onSuccess={() => setOpenDialog(null)} />
      </DialogContent>
    </Dialog>

    <Dialog open={openDialog === 'login'} onOpenChange={(open) => { setOpenDialog(open ? 'login' : null); if (!open) loginMutation.reset() }}>
      <DialogTrigger asChild>
        <Button type="button" className={triggerButtonClassName} aria-label="เข้าสู่ระบบ"><CircleUserRound size={18} aria-hidden="true" /><span className="max-sm:hidden">เข้าสู่ระบบ</span></Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl border-[#b9cbbf] bg-canvas p-5 shadow-2xl sm:max-w-[460px] sm:p-6">
        <DialogCloseButton />
        <FormError message={loginMutation.isError ? loginMutation.error.message : undefined} />
        <DialogHeader className="pr-10 text-left">
          <DialogTitle className="font-heading text-2xl text-ink">เข้าสู่ระบบ</DialogTitle>
          <DialogDescription className="text-base leading-relaxed text-muted">เข้าสู่ระบบเพื่อจัดการข้อมูลและติดตามคำสั่งซื้อของคุณ</DialogDescription>
        </DialogHeader>
        <LoginForm loginMutation={loginMutation} onSuccess={() => setOpenDialog(null)} />
      </DialogContent>
    </Dialog>
  </>
}
