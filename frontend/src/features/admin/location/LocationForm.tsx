import { ArrowLeft, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { locationFormSchema, type LocationFormValues } from './schema'
import { useLocation, useSaveLocation } from './hooks/useLocations'

export function LocationForm({ locationId }: { locationId?: number }) {
  const locationQuery = useLocation(locationId)
  const saveMutation = useSaveLocation()
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: { name: '', isActive: true },
  })

  useEffect(() => {
    if (!locationQuery.data) return
    reset({ name: locationQuery.data.name, isActive: locationQuery.data.isActive })
  }, [locationQuery.data, reset])

  async function submit(values: LocationFormValues) {
    try {
      setError('')
      await saveMutation.mutateAsync({ locationId, input: values })
      navigate('/admin/locations')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'ไม่สามารถบันทึกสถานที่รับสินค้าได้')
    }
  }

  if (locationId && locationQuery.isLoading) return <div className="page-message">กำลังโหลดสถานที่รับสินค้า...</div>
  if (locationId && locationQuery.isError) return <div className="page-message">ไม่สามารถโหลดสถานที่รับสินค้าได้: {locationQuery.error.message}</div>

  return <section className="admin-page product-form-page">
    <div className="admin-page-heading"><div><Link className="admin-back-link" to="/admin/locations"><ArrowLeft size={18} />กลับไปหน้าสถานที่รับสินค้า</Link><h1 className="admin-title">{locationId ? 'แก้ไขสถานที่รับสินค้า' : 'เพิ่มสถานที่รับสินค้า'}</h1></div></div>
    <form className="product-form-card location-form-card" noValidate onSubmit={handleSubmit(submit)}>
      <label className="location-form-field" htmlFor="location-name">ชื่อสถานที่รับสินค้า
        <Input id="location-name" {...register('name', { onChange: () => setError('') })} placeholder="เช่น หน้าโรงเรียนชุมชน" aria-invalid={Boolean(errors.name || error)} aria-describedby={errors.name || error ? 'location-name-error' : undefined} className={errors.name || error ? 'product-field-invalid' : undefined} />
        {(errors.name || error) && <span id="location-name-error" className="product-field-error" role="alert">{errors.name?.message ?? error}</span>}
      </label>
      <label className="location-active-toggle"><input type="checkbox" {...register('isActive')} /><span>เปิดการใช้งาน</span></label>
      <div className="product-form-actions"><Link to="/admin/locations" className="admin-secondary-button">ยกเลิก</Link><button className="admin-primary-button" type="submit" disabled={saveMutation.isPending} aria-busy={saveMutation.isPending}><Save size={18} aria-hidden="true" />{saveMutation.isPending ? 'กำลังบันทึก' : 'บันทึก'}</button></div>
    </form>
  </section>
}
