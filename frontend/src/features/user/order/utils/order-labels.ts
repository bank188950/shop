import type { DeliveryPeriod, OrderPaymentStatus, OrderStatus } from '@/api/user/orders'

const orderStatusLabels: Record<OrderStatus, string> = {
  pending_payment: 'รอชำระเงิน',
  pending_review: 'รอตรวจสอบ',
  preparing: 'เตรียมสินค้า',
  ready_for_delivery: 'พร้อมส่ง',
  delivered: 'ส่งแล้ว',
  cancelled: 'ยกเลิก',
}

const orderStatusClasses: Record<OrderStatus, string> = {
  pending_payment: 'bg-[#fbe3e3] text-[#c0453f]',
  pending_review: 'bg-[#ffeacc] text-[#9c5127]',
  preparing: 'bg-[#e9e2ff] text-[#62519b]',
  ready_for_delivery: 'bg-[#dcedf5] text-[#316b8a]',
  delivered: 'bg-[#def2e1] text-[#287b3b]',
  cancelled: 'bg-[#e6e8e6] text-[#5d6b62]',
}

const paymentStatusLabels: Record<OrderPaymentStatus, string> = {
  pending: 'รอชำระเงิน',
  paid: 'จ่ายแล้ว',
  rejected: 'ยกเลิกการชำระเงิน',
  refunded: 'คืนเงินแล้ว',
}

const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

export function orderStatusLabel(status: OrderStatus) {
  return orderStatusLabels[status]
}

export function orderStatusClass(status: OrderStatus) {
  return orderStatusClasses[status]
}

export function paymentStatusLabel(status: OrderPaymentStatus) {
  return paymentStatusLabels[status]
}

export function deliveryPeriodLabel(period: DeliveryPeriod) {
  return period === 'morning' ? 'รอบเช้า' : 'รอบบ่าย'
}

export function thaiDateLabel(value: string) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  return `${date.getDate()} ${thaiMonths[date.getMonth()]} ${date.getFullYear() + 543}`
}
