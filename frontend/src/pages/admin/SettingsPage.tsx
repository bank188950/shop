import { BellRing, CircleAlert, Clock3, Megaphone, Plus, Save, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { settingsFormSchema, type SettingsFormValues } from '@/features/admin/settings/schema'
import { useSaveSettings, useSettings } from '@/features/admin/settings/hooks/useSettings'

const maxAdvertisementCount = 3
const defaultValues: SettingsFormValues = { morningCutoff: '08:00', morningDelivery: '09:00–10:00', afternoonCutoff: '12:00', afternoonDelivery: '14:00–15:00', noticeMessage: '', isNoticePopupEnabled: false, advertisements: [{ text: '' }], isAdvertisementVisible: false }

export function SettingsPage() {
  const settingsQuery = useSettings()
  const saveMutation = useSaveSettings()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const { register, control, handleSubmit, reset } = useForm<SettingsFormValues>({ resolver: zodResolver(settingsFormSchema), defaultValues })
  const { fields, append, remove } = useFieldArray({ control, name: 'advertisements' })

  useEffect(() => { if (settingsQuery.data) reset({ ...settingsQuery.data, advertisements: settingsQuery.data.advertisementTexts.length ? settingsQuery.data.advertisementTexts.map((text) => ({ text })) : [{ text: '' }] }) }, [reset, settingsQuery.data])
  async function saveSettings(values: SettingsFormValues) { try { setError(''); await saveMutation.mutateAsync({ ...values, advertisementTexts: values.advertisements.map((advertisement) => advertisement.text) }); setSaved(true); window.setTimeout(() => setSaved(false), 1800) } catch (submitError) { setError(submitError instanceof Error ? submitError.message : 'ไม่สามารถบันทึกการตั้งค่าได้') } }

  if (settingsQuery.isLoading) return <div className="page-message">กำลังโหลดการตั้งค่า...</div>
  if (settingsQuery.isError) return <div className="page-message">ไม่สามารถโหลดการตั้งค่าได้: {settingsQuery.error.message}</div>

  return <section className="admin-page">
    <div className="admin-page-heading"><div><h1 className="admin-title">ตั้งค่า</h1></div></div>
    <form className="admin-detail-card" noValidate onSubmit={handleSubmit(saveSettings)}>
      <div className="admin-section-heading"><div><h2><Clock3 size={21} aria-hidden="true" />ตั้งค่ารอบส่ง</h2><p>เวลานี้มีผลกับทุกสถานที่ ลูกค้าจะสั่งได้เฉพาะรอบที่ยังไม่ปิดรับ</p></div></div>
      <div className="schedule-grid">
        <label><strong>รอบเช้า</strong><span>ปิดรับรายการสั่งซื้อ</span><Input type="time" {...register('morningCutoff')} /><span>เวลาจัดส่ง</span><Input {...register('morningDelivery')} /></label>
        <label><strong>รอบบ่าย</strong><span>ปิดรับรายการสั่งซื้อ</span><Input type="time" {...register('afternoonCutoff')} /><span>เวลาจัดส่ง</span><Input {...register('afternoonDelivery')} /></label>
      </div>
      <div className="notice-settings">
        <div className="admin-section-heading"><div><h2><BellRing size={21} aria-hidden="true" />ตั้งค่าการแจ้งข้อมูลเตือน</h2><p>เตรียมข้อความและสถานะ popup สำหรับใช้บนหน้าร้านในอนาคต</p></div></div>
        <label className="notice-message-label" htmlFor="customer-notice"><span className="sr-only">รายละเอียด popup</span><Textarea id="customer-notice" {...register('noticeMessage')} rows={4} placeholder="รายละเอียดที่กรอกจะไปแสดงใน popup" /></label>
        <label className="notice-popup-toggle"><input type="checkbox" {...register('isNoticePopupEnabled')} /><span><strong>เปิดการใช้งาน</strong></span></label>
      </div>
      <div className="notice-settings">
        <div className="admin-section-heading"><div><h2><Megaphone size={21} aria-hidden="true" />ตั้งค่าโฆษณา</h2><p>กำหนดข้อความและการแสดงโฆษณาบนหน้าร้าน</p></div></div>
        <fieldset className="advertisement-list"><p id="advertisement-limit" className="advertisement-limit"><CircleAlert size={15} aria-hidden="true" />เพิ่มได้สูงสุด {maxAdvertisementCount} ข้อความ</p>{fields.map((field, index) => <div className="advertisement-field" key={field.id}><label htmlFor={`advertisement-text-${index}`}><span className="sr-only">คำโฆษณาที่ {index + 1}</span><Input id={`advertisement-text-${index}`} {...register(`advertisements.${index}.text`)} placeholder="กรอกคำโฆษณา" aria-describedby="advertisement-limit" /></label>{fields.length > 1 && <button type="button" className="advertisement-remove" aria-label={`ลบคำโฆษณาที่ ${index + 1}`} onClick={() => remove(index)}><Trash2 size={17} aria-hidden="true" /><span>ลบ</span></button>}</div>)}{fields.length < maxAdvertisementCount && <button type="button" className="advertisement-add" onClick={() => append({ text: '' })}><Plus size={17} aria-hidden="true" />เพิ่มคำโฆษณา</button>}</fieldset>
        <label className="notice-popup-toggle"><input type="checkbox" {...register('isAdvertisementVisible')} /><span><strong>แสดงโฆษณา</strong></span></label>
      </div>
      {error && <p className="banner-form-error" role="alert">{error}</p>}
      <div className="settings-save-action"><button type="submit" className="admin-primary-button" disabled={saveMutation.isPending} aria-busy={saveMutation.isPending}><Save size={18} aria-hidden="true" />{saveMutation.isPending ? 'กำลังบันทึก' : saved ? 'บันทึกแล้ว' : 'บันทึก'}</button></div>
    </form>
  </section>
}
