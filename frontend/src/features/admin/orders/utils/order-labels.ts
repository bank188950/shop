import type { AdminDeliveryPeriod, AdminOrderStatus, AdminPaymentStatus } from '@/api/admin/orders'

export const adminOrderStatuses: AdminOrderStatus[] = ['pending_payment', 'pending_review', 'preparing', 'ready_for_delivery', 'delivered', 'cancelled']

/** สถานะที่เปลี่ยนแบบกลุ่มได้จากหน้ารายการ ต้องตรงกับ ADMIN_ORDER_BULK_STATUSES ฝั่ง backend */
export const adminOrderBulkStatuses = adminOrderStatuses.filter((status) => status !== 'pending_payment')

const orderStatusLabels: Record<AdminOrderStatus, string> = {
  pending_payment: 'รอชำระเงิน',
  pending_review: 'รอตรวจสอบ',
  preparing: 'เตรียมสินค้า',
  ready_for_delivery: 'พร้อมส่ง',
  delivered: 'ส่งแล้ว',
  cancelled: 'ยกเลิก',
}

const orderStatusClasses: Record<AdminOrderStatus, string> = {
  pending_payment: 'pending',
  pending_review: 'reviewing',
  preparing: 'preparing',
  ready_for_delivery: 'delivering',
  delivered: 'success',
  cancelled: 'cancelled',
}

const paymentStatusLabels: Record<AdminPaymentStatus, string> = {
  pending: 'รอชำระเงิน',
  paid: 'จ่ายแล้ว',
  rejected: 'ยกเลิกการชำระเงิน',
  refunded: 'คืนเงินแล้ว',
}

const paymentStatusClasses: Record<AdminPaymentStatus, string> = {
  pending: 'pending',
  paid: 'success',
  rejected: 'cancelled',
  refunded: 'cancelled',
}

export const deliveryPeriods: Record<AdminDeliveryPeriod, { label: string, cutoff: string, deliveryTime: string }> = {
  morning: { label: 'รอบเช้า', cutoff: 'ปิดรับ 08:00', deliveryTime: 'ส่ง 09:00–10:00' },
  afternoon: { label: 'รอบบ่าย', cutoff: 'ปิดรับ 12:00', deliveryTime: 'ส่ง 14:00–15:00' },
}

const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

export function orderStatusLabel(status: AdminOrderStatus) {
  return orderStatusLabels[status]
}

export function orderStatusClass(status: AdminOrderStatus) {
  return orderStatusClasses[status]
}

export function paymentStatusLabel(status: AdminPaymentStatus) {
  return paymentStatusLabels[status]
}

export function paymentStatusClass(status: AdminPaymentStatus) {
  return paymentStatusClasses[status]
}

export function formatPrice(amount: number) {
  return `${amount.toLocaleString('th-TH')} บาท`
}

export function orderedAtLabel(orderedAt: string) {
  const date = new Date(orderedAt)
  const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  return `${date.getDate()} ${thaiMonths[date.getMonth()]} ${date.getFullYear() + 543} ${time}`
}

/** แปลง `YYYY-MM-DD` เป็นวันที่ไทย พ.ศ. โดยไม่ผ่าน Date เพื่อไม่ให้ timezone เลื่อนวัน */
export function deliveryDateLabel(isoDate: string) {
  const [year, month, day] = isoDate.split('-').map(Number)
  return `${day} ${thaiMonths[month - 1]} ${year + 543}`
}

export function todayIsoDate() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}
