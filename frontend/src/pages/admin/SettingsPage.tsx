import { BellRing, CircleAlert, Clock3, Megaphone, Plus, Save, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { settingsFormSchema, type SettingsFormValues } from '@/features/admin/settings/schema'
import { useSaveSettings, useSettings } from '@/features/admin/settings/hooks/useSettings'

const maxAdvertisementCount = 3

const defaultValues: SettingsFormValues = {
  morningOrderCutoff: '08:00',
  morningDeliveryStart: '09:00',
  morningDeliveryEnd: '10:00',
  afternoonOrderCutoff: '12:00',
  afternoonDeliveryStart: '14:00',
  afternoonDeliveryEnd: '15:00',
  noticePopupMessage: '',
  isNoticePopupEnabled: false,
  advertisements: [{ message: '' }],
  isAdvertisementVisible: false,
}

export function SettingsPage() {
  const settingsQuery = useSettings()
  const saveMutation = useSaveSettings()
  const [error, setError] = useState('')
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues,
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'advertisements' })

  useEffect(() => {
    if (!settingsQuery.data) return
    reset({
      ...settingsQuery.data,
      advertisements: settingsQuery.data.advertisements.length ? settingsQuery.data.advertisements.map((message) => ({ message })) : [{ message: '' }],
    })
  }, [reset, settingsQuery.data])

  async function submit(values: SettingsFormValues) {
    try {
      setError('')
      await saveMutation.mutateAsync({ ...values, advertisements: values.advertisements.map((advertisement) => advertisement.message) })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'ไม่สามารถบันทึกการตั้งค่าได้')
    }
  }

  if (settingsQuery.isLoading) return <div className="page-message">กำลังโหลดการตั้งค่า...</div>
  if (settingsQuery.isError) return <div className="page-message">ไม่สามารถโหลดการตั้งค่าได้: {settingsQuery.error.message}</div>

  return <section className="admin-page">
    <div className="admin-page-heading"><div><h1 className="admin-title">ตั้งค่า</h1></div></div>
    <form className="admin-detail-card settings-form" noValidate onSubmit={handleSubmit(submit)}>
      <div className="admin-section-heading"><div><h2><Clock3 size={21} aria-hidden="true" />ตั้งค่ารอบส่ง</h2><p>เวลานี้มีผลกับทุกสถานที่ ลูกค้าจะสั่งได้เฉพาะรอบที่ยังไม่ปิดรับ</p></div></div>
      <div className="schedule-grid">
        <section className="schedule-card"><h3>รอบเช้า</h3>
          <label className="schedule-field">ปิดรับรายการสั่งซื้อ<Input type="time" {...register('morningOrderCutoff')} aria-invalid={Boolean(errors.morningOrderCutoff)} />{errors.morningOrderCutoff && <span className="settings-field-error" role="alert">{errors.morningOrderCutoff.message}</span>}</label>
          <label className="schedule-field">เริ่มจัดส่ง<Input type="time" {...register('morningDeliveryStart')} aria-invalid={Boolean(errors.morningDeliveryStart)} />{errors.morningDeliveryStart && <span className="settings-field-error" role="alert">{errors.morningDeliveryStart.message}</span>}</label>
          <label className="schedule-field">สิ้นสุดจัดส่ง<Input type="time" {...register('morningDeliveryEnd')} aria-invalid={Boolean(errors.morningDeliveryEnd)} />{errors.morningDeliveryEnd && <span className="settings-field-error" role="alert">{errors.morningDeliveryEnd.message}</span>}</label>
        </section>
        <section className="schedule-card"><h3>รอบบ่าย</h3>
          <label className="schedule-field">ปิดรับรายการสั่งซื้อ<Input type="time" {...register('afternoonOrderCutoff')} aria-invalid={Boolean(errors.afternoonOrderCutoff)} />{errors.afternoonOrderCutoff && <span className="settings-field-error" role="alert">{errors.afternoonOrderCutoff.message}</span>}</label>
          <label className="schedule-field">เริ่มจัดส่ง<Input type="time" {...register('afternoonDeliveryStart')} aria-invalid={Boolean(errors.afternoonDeliveryStart)} />{errors.afternoonDeliveryStart && <span className="settings-field-error" role="alert">{errors.afternoonDeliveryStart.message}</span>}</label>
          <label className="schedule-field">สิ้นสุดจัดส่ง<Input type="time" {...register('afternoonDeliveryEnd')} aria-invalid={Boolean(errors.afternoonDeliveryEnd)} />{errors.afternoonDeliveryEnd && <span className="settings-field-error" role="alert">{errors.afternoonDeliveryEnd.message}</span>}</label>
        </section>
      </div>
      <div className="notice-settings">
        <div className="admin-section-heading"><div><h2><BellRing size={21} aria-hidden="true" />ตั้งค่าการแจ้งข้อมูลเตือน</h2><p>ข้อความนี้จะแสดงใน popup หน้าร้านเมื่อเปิดใช้งาน</p></div></div>
        <label className="notice-message-label" htmlFor="customer-notice"><span className="sr-only">รายละเอียด popup</span><Textarea id="customer-notice" {...register('noticePopupMessage')} rows={4} placeholder="รายละเอียดที่กรอกจะไปแสดงใน popup" /></label>
        <label className="notice-popup-toggle"><input type="checkbox" {...register('isNoticePopupEnabled')} /><span><strong>เปิดการใช้งาน</strong></span></label>
      </div>
      <div className="notice-settings">
        <div className="admin-section-heading"><div><h2><Megaphone size={21} aria-hidden="true" />ตั้งค่าโฆษณา</h2><p>กำหนดข้อความและการแสดงโฆษณาบนหน้าร้าน</p></div></div>
        <fieldset className="advertisement-list"><p id="advertisement-limit" className="advertisement-limit"><CircleAlert size={15} aria-hidden="true" />เพิ่มได้สูงสุด {maxAdvertisementCount} ข้อความ</p>{fields.map((field, index) => <div className="advertisement-field" key={field.id}><label htmlFor={`advertisement-text-${index}`}><span className="sr-only">คำโฆษณาที่ {index + 1}</span><Input id={`advertisement-text-${index}`} {...register(`advertisements.${index}.message`)} placeholder="กรอกคำโฆษณา" aria-describedby="advertisement-limit" /></label>{fields.length > 1 && <button type="button" className="advertisement-remove" aria-label={`ลบคำโฆษณาที่ ${index + 1}`} onClick={() => remove(index)}><Trash2 size={17} aria-hidden="true" /><span>ลบ</span></button>}</div>)}{fields.length < maxAdvertisementCount && <button type="button" className="advertisement-add" onClick={() => append({ message: '' })}><Plus size={17} aria-hidden="true" />เพิ่มคำโฆษณา</button>}</fieldset>
        <label className="notice-popup-toggle"><input type="checkbox" {...register('isAdvertisementVisible')} /><span><strong>แสดงโฆษณา</strong></span></label>
      </div>
      {error && <p className="settings-form-error" role="alert">{error}</p>}
      <div className="settings-save-action"><button type="submit" className="admin-primary-button" disabled={saveMutation.isPending} aria-busy={saveMutation.isPending}><Save size={18} aria-hidden="true" />{saveMutation.isPending ? 'กำลังบันทึก' : 'บันทึก'}</button></div>
    </form>
  </section>
}
