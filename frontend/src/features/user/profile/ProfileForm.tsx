import { Save } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCustomerLocations } from '@/features/user/shared/hooks/useCustomerLocations'
import { useUpdateCustomerProfile } from '@/features/user/profile/hooks/useCustomerProfile'
import { profileFormSchema, type ProfileFormValues } from '@/features/user/profile/schema'
import type { CustomerAuth } from '@/api/user/auth'

const inputClassName = 'mt-1.5 h-12 border-[#b9cbbf] bg-white px-3 text-base text-ink placeholder:text-[#728077] focus-visible:border-brand focus-visible:ring-brand/25'

function fieldClassName(hasError: boolean) {
  return `${inputClassName}${hasError ? ' border-[#c84646] focus-visible:border-[#c84646] focus-visible:ring-[#c84646]/25' : ''}`
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <p id={id} className="mt-1.5 mb-0 text-sm font-semibold text-[#c84646]" role="alert">{message}</p> : null
}

export function ProfileForm({ customer }: { customer: CustomerAuth }) {
  const locationsQuery = useCustomerLocations()
  const updateMutation = useUpdateCustomerProfile()
  const { register, control, handleSubmit, reset, formState: { errors, isDirty } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: customer.name,
      phone: customer.phone,
      lineId: customer.lineId,
      locationId: customer.locationId ? String(customer.locationId) : '',
    },
  })

  async function submit(values: ProfileFormValues) {
    try {
      await updateMutation.mutateAsync(values)
      reset(values)
    } catch {
      // แสดงข้อความจาก mutation เหนือปุ่มบันทึก
    }
  }

  return <form className="mt-5 grid gap-4" noValidate onSubmit={handleSubmit(submit)}>
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor="profile-name" className="text-base font-bold text-ink">ชื่อลูกค้า</Label>
        <Input id="profile-name" autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'profile-name-error' : undefined} className={fieldClassName(Boolean(errors.name))} {...register('name')} />
        <FieldError id="profile-name-error" message={errors.name?.message} />
      </div>
      <div>
        <Label htmlFor="profile-phone" className="text-base font-bold text-ink">เบอร์โทรศัพท์</Label>
        <Input id="profile-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="พิมพ์เฉพาะตัวเลข 10 หลัก" maxLength={10} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'profile-phone-error' : undefined} className={fieldClassName(Boolean(errors.phone))} {...register('phone')} />
        <FieldError id="profile-phone-error" message={errors.phone?.message} />
      </div>
      <div>
        <Label htmlFor="profile-location" className="text-base font-bold text-ink">สถานที่ส่งของ</Label>
        <Controller
          control={control}
          name="locationId"
          render={({ field }) => <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger id="profile-location" ref={field.ref} onBlur={field.onBlur} aria-invalid={Boolean(errors.locationId)} aria-describedby={errors.locationId ? 'profile-location-error' : undefined} className={fieldClassName(Boolean(errors.locationId))}>
              <SelectValue placeholder={locationsQuery.isLoading ? 'กำลังโหลดสถานที่ส่งของ' : 'เลือกสถานที่ส่งของ'} />
            </SelectTrigger>
            <SelectContent>
              {(locationsQuery.data ?? []).map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}
            </SelectContent>
          </Select>}
        />
        <FieldError id="profile-location-error" message={errors.locationId?.message} />
      </div>
      <div>
        <Label htmlFor="profile-line-id" className="text-base font-bold text-ink">LINE ID <span className="text-sm font-semibold text-muted">(ไม่บังคับ)</span></Label>
        <Input id="profile-line-id" placeholder="ชื่อแอคเคาท์ LINE" aria-invalid={Boolean(errors.lineId)} aria-describedby={errors.lineId ? 'profile-line-id-error' : undefined} className={fieldClassName(Boolean(errors.lineId))} {...register('lineId')} />
        <FieldError id="profile-line-id-error" message={errors.lineId?.message} />
      </div>
    </div>
    {updateMutation.isError && <p className="m-0 rounded-xl bg-[#fbeaea] px-3 py-3.5 text-center text-base font-semibold text-[#c84646]" role="alert">{updateMutation.error.message}</p>}
    {updateMutation.isSuccess && !isDirty && <p className="m-0 rounded-xl bg-[#e1f3e5] px-3 py-3.5 text-center text-base font-semibold text-[#1d6b32]" role="status">บันทึกข้อมูลแล้ว</p>}
    <Button type="submit" disabled={updateMutation.isPending} aria-busy={updateMutation.isPending} className="min-h-12 justify-self-end rounded-full bg-[#76503a] px-16 text-lg font-extrabold text-white has-[>svg]:px-16 hover:bg-[#5f3d2b] max-sm:justify-self-stretch max-sm:px-8 max-sm:has-[>svg]:px-8">
      <Save size={18} aria-hidden="true" />{updateMutation.isPending ? 'กำลังบันทึก' : 'บันทึก'}
    </Button>
  </form>
}
