import { useRef, useState } from 'react'
import { Check, Download, QrCode, X } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useDeliverySettings, usePayUserOrder } from '@/features/user/order/hooks/useUserOrders'
import { downloadPaymentQr, paymentQrValue } from '@/features/user/order/utils/payment-qr'
import type { UserOrder } from '@/api/user/orders'

export function PaymentQrDialog({ order }: { order: UserOrder }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const settingsQuery = useDeliverySettings()
  const payOrderMutation = usePayUserOrder()

  const payOrder = async () => {
    setError('')
    try {
      await payOrderMutation.mutateAsync(order.id)
      setOpen(false)
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'ไม่สามารถยืนยันการชำระเงินได้')
    }
  }

  return <Dialog open={open} onOpenChange={(next) => { setOpen(next); setError('') }}>
    <DialogTrigger asChild>
      <button type="button" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-brand px-5 text-lg font-extrabold text-white transition hover:bg-brand-dark max-md:w-full">
        <QrCode size={20} strokeWidth={2.5} aria-hidden="true" />ชำระเงิน
      </button>
    </DialogTrigger>
    <DialogContent showCloseButton={false} className="max-w-md border border-[#d8dfd5] bg-white shadow-2xl">
      <DialogClose asChild>
        <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-2 z-10 size-11 rounded-full text-muted hover:bg-[#e1f3e5] hover:text-brand" aria-label="ปิดหน้าต่าง"><X size={18} strokeWidth={2.5} aria-hidden="true" /></Button>
      </DialogClose>
      <DialogHeader>
        <DialogTitle className="font-heading text-2xl text-ink">สแกน QR Code เพื่อชำระเงิน</DialogTitle>
        <DialogDescription className="text-base text-muted">คำสั่งซื้อ {order.orderNumber}</DialogDescription>
      </DialogHeader>
      <div className="grid place-items-center gap-4 rounded-xl border-2 border-dashed border-[#77a984] bg-white p-5 text-center">
        <div className="grid place-items-center rounded-xl border border-[#d8dfd5] bg-white p-2 shadow-inner">
          <QRCodeCanvas ref={canvasRef} value={paymentQrValue(order.orderNumber, order.totalAmount)} size={176} bgColor="#ffffff" fgColor="#000000" level="M" marginSize={1} title={`QR Code สำหรับชำระเงินคำสั่งซื้อ ${order.orderNumber}`} />
        </div>
        <div>
          <p className="m-0 text-xl font-extrabold text-brand">ยอดชำระ {order.totalAmount.toLocaleString('th-TH')} บาท</p>
          <p className="mt-1 mb-0 text-base text-muted">ชำระเงินภายใน {settingsQuery.data?.paymentMinutes ?? 20} นาที ไม่นั้นคำสั่งซื้อจะถูกยกเลิกครับ</p>
        </div>
      </div>
      {error && <p className="m-0 text-base font-bold text-[#c84646]" role="alert">{error}</p>}
      <div className="grid gap-3">
        <button type="button" onClick={() => downloadPaymentQr(canvasRef.current, order.orderNumber)} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[#76503a] px-4 text-lg font-extrabold text-[#76503a] transition hover:bg-[#f6efe9]">
          <Download size={20} aria-hidden="true" />ดาวน์โหลด QR Code
        </button>
        <button type="button" onClick={payOrder} disabled={payOrderMutation.isPending} aria-busy={payOrderMutation.isPending} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brand px-4 text-lg font-extrabold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50">
          {payOrderMutation.isPending ? 'กำลังยืนยัน' : 'ชำระเงินแล้ว'} <Check size={20} aria-hidden="true" />
        </button>
      </div>
    </DialogContent>
  </Dialog>
}
