import { useId, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, CircleX, ImagePlus } from 'lucide-react'
import Swal from 'sweetalert2'
import { swalBaseOptions } from '@/lib/swal'
import { usePayUserOrder } from '@/features/user/order/hooks/useUserOrders'
import { slipUploadSchema, type SlipUploadValues } from '@/features/user/order/schema'
import type { UserOrder } from '@/api/user/orders'

/**
 * แนบสลิปเพื่อยืนยันการชำระเงิน ถ้าตรวจไม่ผ่านจะคงสถานะรอชำระเงินไว้ให้ลูกค้าแนบใหม่ได้
 * ทั้งข้อผิดพลาดของไฟล์และผลตรวจจากฝั่ง server แสดงเป็นข้อความใต้ช่องอัปโหลดเหมือนกัน เพื่อให้ทุกหน้าที่ใช้ component นี้หน้าตาตรงกัน
 */
export function SlipUploadForm({ order, onPaid }: {
  order: UserOrder
  onPaid?: (order: UserOrder) => void
}) {
  const [serverError, setServerError] = useState('')
  const inputId = useId()
  const errorId = useId()
  const payOrderMutation = usePayUserOrder()
  const { register, handleSubmit, watch, resetField, formState: { errors } } = useForm<SlipUploadValues>({ resolver: zodResolver(slipUploadSchema) })

  const selectedFile = watch('slip')?.[0]
  const errorMessage = errors.slip?.message ?? serverError

  // react-hook-form ถือ ref ของ input อยู่ ต้องยืมมาเก็บไว้เองเพื่อล้างค่าของ input จริง
  const { ref: registerSlipRef, onChange: registerSlipChange, ...slipField } = register('slip')
  const slipInputRef = useRef<HTMLInputElement | null>(null)

  function clearSlip() {
    // ต้องล้าง value ของ input ด้วย ไม่ใช่แค่ state ของฟอร์ม ไม่งั้นเลือกไฟล์เดิมซ้ำจะไม่เกิด onChange
    if (slipInputRef.current) slipInputRef.current.value = ''
    resetField('slip')
    setServerError('')
  }

  const submit = handleSubmit(async (values) => {
    setServerError('')
    try {
      const paidOrder = await payOrderMutation.mutateAsync({ orderId: order.id, slip: values.slip[0] })
      // รอให้ลูกค้ากดรับทราบก่อน แล้วหน้าที่เรียกจึงพาไปต่อ ไม่ให้เปลี่ยนหน้าหนีไปก่อนที่ลูกค้าจะได้อ่าน
      await Swal.fire({
        ...swalBaseOptions,
        showCancelButton: false,
        icon: 'success',
        title: 'ชำระเงินสำเร็จ',
        html: `<span class="grid gap-2">
          <span>คำสั่งซื้อ <span class="font-semibold text-[#2f83d4]">${paidOrder.orderNumber}</span></span>
          <span>ยอดที่ตรวจสอบแล้ว ${paidOrder.totalAmount.toLocaleString('th-TH')} บาท</span>
          <span>คำสั่งซื้อเข้าสู่ขั้นตอนรอตรวจสอบ</span>
        </span>`,
        confirmButtonText: 'ตกลง',
      })
      onPaid?.(paidOrder)
    } catch (exception) {
      setServerError(exception instanceof Error ? exception.message : 'ไม่สามารถยืนยันการชำระเงินได้')
    }
  })

  return (
    <form onSubmit={submit} noValidate className="grid gap-2">
      <label htmlFor={inputId} className="inline-flex min-h-[54px] w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-[#76503a] px-4 text-lg font-extrabold text-[#76503a] transition hover:bg-[#f6efe9]">
        <ImagePlus size={20} aria-hidden="true" />{selectedFile ? 'เปลี่ยนรูปสลิป' : 'เลือกรูปสลิปการโอนเงิน'}
      </label>
      <input
        {...slipField}
        // ผลตรวจของไฟล์เดิมไม่เกี่ยวกับไฟล์ใหม่ ต้องล้างทิ้งตอนเลือกไฟล์ ไม่งั้นข้อความค้างจนกดยืนยันรอบถัดไป
        onChange={(event) => { setServerError(''); return registerSlipChange(event) }}
        ref={(element) => { registerSlipRef(element); slipInputRef.current = element }}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png"
        className="sr-only"
        aria-invalid={errorMessage ? true : undefined}
        aria-describedby={errorMessage ? errorId : undefined}
      />

      {/* กันความสูงไว้เท่ากันทุกสถานะ ไม่ให้เลย์เอาต์กระโดดตอนขึ้นข้อความผิดพลาดหรือตอนเลือกไฟล์ */}
      <div id={errorId} role={errorMessage ? 'alert' : undefined} className="flex min-h-8 items-center gap-1 text-base font-bold text-[#c84646]">
        {errorMessage ? errorMessage : selectedFile ? <>
          <span className="font-bold break-all text-[#455048]">{selectedFile.name}</span>
          <button type="button" onClick={clearSlip} aria-label={`ลบรูปสลิป ${selectedFile.name}`} className="grid size-8 shrink-0 place-items-center rounded-full text-[#c84646] transition hover:bg-[#fbe3e3]">
            <CircleX size={18} aria-hidden="true" />
          </button>
        </> : null}
      </div>

      <button
        type="submit"
        disabled={payOrderMutation.isPending}
        aria-busy={payOrderMutation.isPending}
        className="inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full bg-brand px-4 text-lg font-extrabold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {payOrderMutation.isPending ? 'กำลังตรวจสอบสลิป' : 'ยืนยันการชำระเงิน'} <Check size={20} aria-hidden="true" />
      </button>
    </form>
  )
}
