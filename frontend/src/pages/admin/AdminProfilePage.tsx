import { ImagePlus, Save, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { adminProfileFormSchema, type AdminProfileFormValues } from '@/features/admin/profile/schema'
import { useAdminProfile, useSaveAdminProfile } from '@/features/admin/profile/hooks/useAdminProfile'

export function AdminProfilePage() {
  const profileQuery = useAdminProfile()
  const saveMutation = useSaveAdminProfile()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const { control, handleSubmit, register, reset, formState: { errors } } = useForm<AdminProfileFormValues>({ resolver: zodResolver(adminProfileFormSchema), defaultValues: { name: '', avatar: null } })

  useEffect(() => {
    if (!profileQuery.data) return
    reset({ name: profileQuery.data.name, avatar: null })
    setAvatarUrl(profileQuery.data.avatarUrl)
  }, [profileQuery.data, reset])

  async function saveProfile(values: AdminProfileFormValues) {
    try {
      setSubmitError('')
      const profile = await saveMutation.mutateAsync(values)
      reset({ name: profile.name, avatar: null })
      setAvatarUrl(profile.avatarUrl)
      setSaved(true)
      window.setTimeout(() => setSaved(false), 1800)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'ไม่สามารถบันทึกข้อมูลผู้ดูแลระบบได้')
    }
  }

  if (profileQuery.isLoading) return <div className="page-message">กำลังโหลดข้อมูลผู้ดูแลระบบ...</div>
  if (profileQuery.isError) return <div className="page-message">ไม่สามารถโหลดข้อมูลผู้ดูแลระบบได้: {profileQuery.error.message}</div>

  return <section className="admin-page">
    <div className="admin-page-heading admin-profile-page-heading">
      <div><h1 className="admin-title">Admin Profile</h1></div>
    </div>
    <form className="admin-detail-card admin-profile-card" noValidate onSubmit={handleSubmit(saveProfile)}>
      <div className="admin-section-heading"><div><h2><UserRound size={21} aria-hidden="true" />ข้อมูลผู้ดูแลระบบ</h2><p>จัดการข้อมูลสำหรับบัญชีผู้ดูแลระบบ</p></div></div>
      <div className="admin-profile-form">
        <label htmlFor="admin-username"><span>Username</span><Input id="admin-username" value={profileQuery.data!.username} disabled /></label>
        <label htmlFor="admin-name"><span>Name</span><Input id="admin-name" {...register('name')} aria-invalid={Boolean(errors.name)} />{errors.name && <p className="admin-profile-field-error" role="alert">{errors.name.message}</p>}</label>
        <div className="admin-profile-icon-field"><span>ไอคอนผู้ดูแลระบบ</span><Controller control={control} name="avatar" render={({ field }) => <><div className="banner-image-upload admin-profile-image-upload"><ImagePlus size={27} aria-hidden="true" /><div><strong>อัปโหลดไอคอนผู้ดูแลระบบ</strong><span>รองรับ JPG, PNG ขนาดไม่เกิน 5 MB</span></div><Input id="admin-avatar" type="file" accept="image/png,image/jpeg" aria-label="อัปโหลดไอคอนผู้ดูแลระบบ" onChange={(event) => { const file = event.target.files?.[0] ?? null; field.onChange(file); if (file) setAvatarUrl(URL.createObjectURL(file)) }} /></div>{errors.avatar && <p className="admin-profile-field-error" role="alert">{errors.avatar.message}</p>}</>} />{avatarUrl && <div className="admin-profile-avatar-preview"><strong>ตัวอย่างไอคอน</strong><span className="admin-profile-form-avatar"><img src={avatarUrl} alt="ตัวอย่างไอคอนผู้ดูแลระบบ" /></span></div>}</div>
      </div>
      {submitError && <p className="banner-form-error" role="alert">{submitError}</p>}
      <div className="settings-save-action"><button type="submit" className="admin-primary-button" disabled={saveMutation.isPending} aria-busy={saveMutation.isPending}><Save size={18} aria-hidden="true" />{saveMutation.isPending ? 'กำลังบันทึก' : saved ? 'บันทึกแล้ว' : 'บันทึก'}</button></div>
    </form>
  </section>
}
