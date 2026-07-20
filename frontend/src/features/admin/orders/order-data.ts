export type DeliveryPeriod = 'morning' | 'afternoon'
export type PaymentStatus = 'รอชำระเงิน' | 'จ่ายแล้ว'
export type OrderStatus = 'เตรียมของ' | 'ออกส่งแล้ว' | 'ส่งแล้ว' | 'ยกเลิก'
export const orderListStatuses = ['รอชำระเงิน', 'เตรียมของ', 'ออกส่งแล้ว', 'ส่งแล้ว', 'ยกเลิก'] as const
export type OrderListStatus = typeof orderListStatuses[number]

export type OrderItem = {
  name: string
  quantity: number
  unit: string
  unitPrice: number
}

export type AdminOrder = {
  id: string
  orderedAt: string
  deliveryDate: string
  period: DeliveryPeriod
  location: string
  customerName: string
  phone: string
  lineId: string
  items: OrderItem[]
  paymentStatus: PaymentStatus
  status: OrderStatus
}

export const deliveryPeriods: Record<DeliveryPeriod, { label: string; cutoff: string; deliveryTime: string }> = {
  morning: { label: 'รอบเช้า', cutoff: 'ปิดรับ 08:00', deliveryTime: 'ส่ง 09:00–10:00' },
  afternoon: { label: 'รอบบ่าย', cutoff: 'ปิดรับ 12:00', deliveryTime: 'ส่ง 14:00–15:00' },
}

export const mockOrders: AdminOrder[] = [
  { id: 'ORD-200720-01', orderedAt: '20 ก.ค. 2569 07:18', deliveryDate: '2026-07-20', period: 'morning', location: 'จุดรับสินค้า A', customerName: 'คุณบอม', phone: '0812345678', lineId: '@bom_eats', items: [{ name: 'ลูกชิ้นหมูพรีเมียม', quantity: 8, unit: 'ไม้', unitPrice: 15 }, { name: 'ไส้กรอกอีสานย่าง', quantity: 3, unit: 'ไม้', unitPrice: 15 }], paymentStatus: 'จ่ายแล้ว', status: 'เตรียมของ' },
  { id: 'ORD-200720-02', orderedAt: '20 ก.ค. 2569 07:26', deliveryDate: '2026-07-20', period: 'morning', location: 'จุดรับสินค้า A', customerName: 'คุณฝน', phone: '0892223344', lineId: '@fon_line', items: [{ name: 'ลูกชิ้นเนื้อเอ็น', quantity: 5, unit: 'ไม้', unitPrice: 20 }, { name: 'น้ำเก๊กฮวยเย็น', quantity: 2, unit: 'แก้ว', unitPrice: 25 }], paymentStatus: 'จ่ายแล้ว', status: 'เตรียมของ' },
  { id: 'ORD-200720-03', orderedAt: '20 ก.ค. 2569 07:41', deliveryDate: '2026-07-20', period: 'morning', location: 'จุดรับสินค้า B', customerName: 'คุณต้น', phone: '0825556677', lineId: '@ton_food', items: [{ name: 'ลูกชิ้นหมูพรีเมียม', quantity: 7, unit: 'ไม้', unitPrice: 15 }, { name: 'ไส้กรอกอีสานย่าง', quantity: 4, unit: 'ไม้', unitPrice: 15 }], paymentStatus: 'รอชำระเงิน', status: 'เตรียมของ' },
  { id: 'ORD-200720-04', orderedAt: '20 ก.ค. 2569 10:36', deliveryDate: '2026-07-20', period: 'afternoon', location: 'จุดรับสินค้า A', customerName: 'คุณแอน', phone: '0918889900', lineId: '@ann_food', items: [{ name: 'ลูกชิ้นเนื้อเอ็น', quantity: 4, unit: 'ไม้', unitPrice: 20 }, { name: 'น้ำเก๊กฮวยเย็น', quantity: 1, unit: 'แก้ว', unitPrice: 25 }], paymentStatus: 'จ่ายแล้ว', status: 'เตรียมของ' },
  { id: 'ORD-200720-05', orderedAt: '20 ก.ค. 2569 11:02', deliveryDate: '2026-07-20', period: 'afternoon', location: 'จุดรับสินค้า C', customerName: 'คุณกอล์ฟ', phone: '0843334455', lineId: '@golf_golf', items: [{ name: 'ลูกชิ้นหมูพรีเมียม', quantity: 6, unit: 'ไม้', unitPrice: 15 }, { name: 'ไส้กรอกอีสานย่าง', quantity: 2, unit: 'ไม้', unitPrice: 15 }], paymentStatus: 'จ่ายแล้ว', status: 'ออกส่งแล้ว' },
  { id: 'ORD-200720-06', orderedAt: '20 ก.ค. 2569 11:18', deliveryDate: '2026-07-20', period: 'afternoon', location: 'จุดรับสินค้า B', customerName: 'คุณเมย์', phone: '0805556611', lineId: '@may_order', items: [{ name: 'ลูกชิ้นหมูพรีเมียม', quantity: 4, unit: 'ไม้', unitPrice: 15 }], paymentStatus: 'รอชำระเงิน', status: 'ยกเลิก' },
  { id: 'ORD-200720-07', orderedAt: '20 ก.ค. 2569 11:34', deliveryDate: '2026-07-20', period: 'afternoon', location: 'จุดรับสินค้า C', customerName: 'คุณปาล์ม', phone: '0824447788', lineId: '@palm_food', items: [{ name: 'ไส้กรอกอีสานย่าง', quantity: 5, unit: 'ไม้', unitPrice: 15 }, { name: 'น้ำเก๊กฮวยเย็น', quantity: 1, unit: 'แก้ว', unitPrice: 25 }], paymentStatus: 'จ่ายแล้ว', status: 'ส่งแล้ว' },
  { id: 'ORD-190720-01', orderedAt: '19 ก.ค. 2569 11:22', deliveryDate: '2026-07-19', period: 'afternoon', location: 'จุดรับสินค้า B', customerName: 'คุณนิด', phone: '0867778899', lineId: '@nid_day', items: [{ name: 'น้ำเก๊กฮวยเย็น', quantity: 3, unit: 'แก้ว', unitPrice: 25 }, { name: 'ลูกชิ้นเนื้อเอ็น', quantity: 2, unit: 'ไม้', unitPrice: 20 }], paymentStatus: 'จ่ายแล้ว', status: 'ส่งแล้ว' },
]

export function getOrderTotal(order: AdminOrder) {
  return order.items.reduce((total, item) => total + item.quantity * item.unitPrice, 0)
}

export function getOrderListStatus(order: AdminOrder): OrderListStatus {
  if (order.status === 'ยกเลิก') return 'ยกเลิก'
  if (order.paymentStatus === 'รอชำระเงิน') return 'รอชำระเงิน'
  return order.status
}

export function formatPrice(amount: number) {
  return `${amount.toLocaleString('th-TH')} บาท`
}

export function statusClass(status: OrderStatus | PaymentStatus) {
  if (status === 'รอชำระเงิน') return 'pending'
  if (status === 'ยกเลิก') return 'cancelled'
  if (status === 'ออกส่งแล้ว') return 'delivering'
  if (status === 'เตรียมของ') return 'preparing'
  return 'success'
}
