import { useRef, useState } from 'react'
import { QrCode, X } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useDeliverySettings } from '@/features/user/order/hooks/useUserOrders'
import { SlipUploadForm } from '@/features/user/order/SlipUploadForm'
import { downloadPaymentQr } from '@/features/user/order/utils/payment-qr'
import type { UserOrder } from '@/api/user/orders'

export function PaymentQrDialog({ order }: { order: UserOrder }) {
  const [open, setOpen] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const settingsQuery = useDeliverySettings()
  const accountName = settingsQuery.data?.paymentAccountName

  return <Dialog open={open} onOpenChange={setOpen}>
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
        <DialogTitle className="font-heading text-2xl text-ink">ช่องทางการชำระเงิน</DialogTitle>
        <DialogDescription className="text-lg text-muted">คำสั่งซื้อ <span className="font-semibold text-[#2f83d4]">{order.orderNumber}</span></DialogDescription>
      </DialogHeader>
      <div className="grid place-items-center gap-4 rounded-xl border-2 border-dashed border-[#77a984] bg-white p-5 text-center">
        {order.paymentQr
          ? <div className="grid place-items-center rounded-xl border border-[#d8dfd5] bg-white p-2 shadow-inner">
              <QRCodeCanvas ref={canvasRef} value={order.paymentQr} size={176} bgColor="#ffffff" fgColor="#000000" level="M" marginSize={1} title={`QR Code สำหรับชำระเงินคำสั่งซื้อ ${order.orderNumber}`} />
            </div>
          : <p className="m-0 text-lg font-bold text-[#c84646]">ยังไม่มี QR สำหรับชำระเงิน กรุณาติดต่อแอดมิน</p>}
        <div>
          <p className="m-0 text-xl font-extrabold text-ink">สแกน QR Code เพื่อชำระเงิน</p>
          <p className="mt-1 mb-0 text-lg font-bold text-brand">ยอดชำระ {order.totalAmount.toLocaleString('th-TH')} บาท</p>
          {accountName && <p className="mt-1 mb-0 text-base font-bold text-[#455048]">โอนเข้าบัญชี {accountName}</p>}
          <p className="mt-1 mb-0 text-base text-muted">ชำระเงินภายใน {settingsQuery.data?.paymentMinutes ?? 20} นาที ไม่นั้นคำสั่งซื้อจะถูกยกเลิกครับ</p>
        </div>
        <button type="button" onClick={() => downloadPaymentQr(canvasRef.current, order.orderNumber)} disabled={!order.paymentQr} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-brand px-6 text-lg font-extrabold text-brand transition hover:bg-[#e1f3e5] disabled:cursor-not-allowed disabled:opacity-50">
          <QrCode size={20} aria-hidden="true" />ดาวน์โหลด QR Code
        </button>
      </div>
      <SlipUploadForm order={order} onPaid={() => setOpen(false)} />
    </DialogContent>
  </Dialog>
}
