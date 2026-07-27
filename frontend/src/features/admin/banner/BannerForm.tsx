import { ArrowLeft, ImagePlus, Save } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { createBannerFormSchema, type BannerFormValues, updateBannerFormSchema } from './schema'
import { useBanner, useSaveBanner } from './hooks/useBanners'

export function BannerForm({ bannerId }: { bannerId?: number }) {
  const bannerQuery = useBanner(bannerId)
  const saveMutation = useSaveBanner()
  const [imagePreview, setImagePreview] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<BannerFormValues>({
    resolver: zodResolver(bannerId ? updateBannerFormSchema : createBannerFormSchema),
    defaultValues: { title: '', image: null, isActive: true },
  })

  useEffect(() => {
    if (!bannerQuery.data) return
    reset({ title: bannerQuery.data.title, image: null, isActive: bannerQuery.data.isActive })
    setImagePreview(bannerQuery.data.imageUrl)
  }, [bannerQuery.data, reset])

  useEffect(() => () => {
    if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview)
  }, [imagePreview])

  function selectImage(file: File | undefined) {
    const image = file ?? null
    setValue('image', image, { shouldValidate: true })
    if (image) setImagePreview(URL.createObjectURL(image))
  }

  async function submit(values: BannerFormValues) {
    try {
      setError('')
      await saveMutation.mutateAsync({ bannerId, input: values })
      navigate('/admin/banners')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'ไม่สามารถบันทึกแบนเนอร์ได้')
    }
  }

  if (bannerId && bannerQuery.isLoading) return <div className="page-message">กำลังโหลดแบนเนอร์...</div>
  if (bannerId && bannerQuery.isError) return <div className="page-message">ไม่สามารถโหลดแบนเนอร์ได้: {bannerQuery.error.message}</div>

  return <section className="admin-page banner-form-page">
    <div className="admin-page-heading"><div><Link className="admin-back-link" to="/admin/banners"><ArrowLeft size={18} />กลับไปหน้าแบนเนอร์</Link><h1 className="admin-title">{bannerId ? 'แก้ไขแบนเนอร์' : 'เพิ่มแบนเนอร์'}</h1></div></div>
    <form className="banner-form-card" noValidate onSubmit={handleSubmit(submit)}>
      <label className="banner-form-field" htmlFor="banner-title">หัวข้อ<Input id="banner-title" {...register('title', { onChange: () => setError('') })} placeholder="กรอกหัวข้อแบนเนอร์" aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? 'banner-title-error' : undefined} className={errors.title ? 'product-field-invalid' : undefined} />{errors.title && <span id="banner-title-error" className="banner-field-error" role="alert">{errors.title.message}</span>}</label>
      <div className="banner-image-field"><div className={`banner-image-upload ${errors.image ? 'is-invalid' : ''}`}><ImagePlus size={27} aria-hidden="true" /><div><strong>อัปโหลดรูปภาพแบนเนอร์</strong><span>รองรับ JPG, PNG ขนาดไม่เกิน 5 MB</span><span className="banner-image-size-hint">ขนาดรูป 1800 × 900 px</span></div><Input type="file" accept="image/png,image/jpeg" aria-label="อัปโหลดรูปภาพแบนเนอร์" aria-invalid={Boolean(errors.image)} aria-describedby={errors.image ? 'banner-image-error' : undefined} onChange={(event) => selectImage(event.target.files?.[0])} /></div>{errors.image && <span id="banner-image-error" className="banner-field-error" role="alert">{errors.image.message}</span>}</div>
      {imagePreview && <div className="banner-draft-preview"><strong>ตัวอย่างแบนเนอร์</strong><img src={imagePreview} alt="ตัวอย่างแบนเนอร์" /></div>}
      <label className="product-active-toggle"><input type="checkbox" {...register('isActive')} /><span>เปิดการใช้งาน</span></label>
      {error && <p className="banner-form-error" role="alert">{error}</p>}
      <div className="banner-form-actions"><Link to="/admin/banners" className="admin-secondary-button">ยกเลิก</Link><button className="admin-primary-button" type="submit" disabled={saveMutation.isPending} aria-busy={saveMutation.isPending}><Save size={18} aria-hidden="true" />{saveMutation.isPending ? 'กำลังบันทึก' : 'บันทึก'}</button></div>
    </form>
  </section>
}
