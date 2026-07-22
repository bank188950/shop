export type DeliveryPeriod = 'morning' | 'afternoon'
export type PaymentStatus = 'รอชำระเงิน' | 'จ่ายแล้ว'
export const orderListStatuses = ['รอชำระเงิน', 'รอตรวจสอบ', 'เตรียมของ', 'พร้อมส่ง', 'ส่งแล้ว', 'ยกเลิก'] as const
export type OrderListStatus = typeof orderListStatuses[number]
export type OrderStatus = OrderListStatus

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
  { id: 'PO-200720-01', orderedAt: '20 ก.ค. 2569 07:18', deliveryDate: '2026-07-20', period: 'morning', location: 'จุดรับสินค้า A', customerName: 'คุณบอม', phone: '0812345678', lineId: '@bom_eats', items: [{ name: 'ลูกชิ้นหมูพรีเมียม', quantity: 8, unit: 'ไม้', unitPrice: 15 }, { name: 'ไส้กรอกอีสานย่าง', quantity: 3, unit: 'ไม้', unitPrice: 15 }], paymentStatus: 'รอชำระเงิน', status: 'รอชำระเงิน' },
  { id: 'PO-200720-02', orderedAt: '20 ก.ค. 2569 07:26', deliveryDate: '2026-07-20', period: 'morning', location: 'จุดรับสินค้า A', customerName: 'คุณฝน', phone: '0892223344', lineId: '@fon_line', items: [{ name: 'ลูกชิ้นเนื้อเอ็น', quantity: 5, unit: 'ไม้', unitPrice: 20 }, { name: 'น้ำเก๊กฮวยเย็น', quantity: 2, unit: 'แก้ว', unitPrice: 25 }], paymentStatus: 'จ่ายแล้ว', status: 'รอตรวจสอบ' },
  { id: 'PO-200720-03', orderedAt: '20 ก.ค. 2569 07:41', deliveryDate: '2026-07-20', period: 'morning', location: 'จุดรับสินค้า B', customerName: 'คุณต้น', phone: '0825556677', lineId: '@ton_food', items: [{ name: 'ลูกชิ้นหมูพรีเมียม', quantity: 7, unit: 'ไม้', unitPrice: 15 }, { name: 'ไส้กรอกอีสานย่าง', quantity: 4, unit: 'ไม้', unitPrice: 15 }], paymentStatus: 'จ่ายแล้ว', status: 'เตรียมของ' },
  { id: 'PO-200720-04', orderedAt: '20 ก.ค. 2569 10:36', deliveryDate: '2026-07-20', period: 'afternoon', location: 'จุดรับสินค้า A', customerName: 'คุณแอน', phone: '0918889900', lineId: '@ann_food', items: [{ name: 'ลูกชิ้นเนื้อเอ็น', quantity: 4, unit: 'ไม้', unitPrice: 20 }, { name: 'น้ำเก๊กฮวยเย็น', quantity: 1, unit: 'แก้ว', unitPrice: 25 }], paymentStatus: 'จ่ายแล้ว', status: 'เตรียมของ' },
  { id: 'PO-200720-05', orderedAt: '20 ก.ค. 2569 11:02', deliveryDate: '2026-07-20', period: 'afternoon', location: 'จุดรับสินค้า C', customerName: 'คุณกอล์ฟ', phone: '0843334455', lineId: '@golf_golf', items: [{ name: 'ลูกชิ้นหมูพรีเมียม', quantity: 6, unit: 'ไม้', unitPrice: 15 }, { name: 'ไส้กรอกอีสานย่าง', quantity: 2, unit: 'ไม้', unitPrice: 15 }], paymentStatus: 'จ่ายแล้ว', status: 'พร้อมส่ง' },
  { id: 'PO-200720-06', orderedAt: '20 ก.ค. 2569 11:18', deliveryDate: '2026-07-20', period: 'afternoon', location: 'จุดรับสินค้า B', customerName: 'คุณเมย์', phone: '0805556611', lineId: '@may_order', items: [{ name: 'ลูกชิ้นหมูพรีเมียม', quantity: 4, unit: 'ไม้', unitPrice: 15 }], paymentStatus: 'รอชำระเงิน', status: 'ยกเลิก' },
  { id: 'PO-200720-07', orderedAt: '20 ก.ค. 2569 11:34', deliveryDate: '2026-07-20', period: 'afternoon', location: 'จุดรับสินค้า C', customerName: 'คุณปาล์ม', phone: '0824447788', lineId: '@palm_food', items: [{ name: 'ไส้กรอกอีสานย่าง', quantity: 5, unit: 'ไม้', unitPrice: 15 }, { name: 'น้ำเก๊กฮวยเย็น', quantity: 1, unit: 'แก้ว', unitPrice: 25 }], paymentStatus: 'จ่ายแล้ว', status: 'ส่งแล้ว' },
  { id: 'PO-200720-08', orderedAt: '20 ก.ค. 2569 11:46', deliveryDate: '2026-07-20', period: 'afternoon', location: 'จุดรับสินค้า A', customerName: 'คุณนิด', phone: '0867778899', lineId: '@nid_day', items: [{ name: 'น้ำเก๊กฮวยเย็น', quantity: 3, unit: 'แก้ว', unitPrice: 25 }, { name: 'ลูกชิ้นเนื้อเอ็น', quantity: 2, unit: 'ไม้', unitPrice: 20 }], paymentStatus: 'จ่ายแล้ว', status: 'ส่งแล้ว' },
  { id: 'PO-200720-09', orderedAt: '20 ก.ค. 2569 12:05', deliveryDate: '2026-07-20', period: 'afternoon', location: 'จุดรับสินค้า B', customerName: 'คุณจอย', phone: '0831112233', lineId: '@joy_snack', items: [{ name: 'ลูกชิ้นหมูพรีเมียม', quantity: 5, unit: 'ไม้', unitPrice: 15 }, { name: 'น้ำเก๊กฮวยเย็น', quantity: 2, unit: 'แก้ว', unitPrice: 25 }], paymentStatus: 'รอชำระเงิน', status: 'รอชำระเงิน' },
  { id: 'PO-200720-10', orderedAt: '20 ก.ค. 2569 12:22', deliveryDate: '2026-07-20', period: 'afternoon', location: 'จุดรับสินค้า C', customerName: 'คุณอาร์ต', phone: '0876665544', lineId: '@art_grill', items: [{ name: 'ไส้กรอกอีสานย่าง', quantity: 6, unit: 'ไม้', unitPrice: 15 }], paymentStatus: 'จ่ายแล้ว', status: 'พร้อมส่ง' },
  ...Array.from({ length: 20 }, (_, index): AdminOrder => {
    const customers = ['คุณนัท', 'คุณเมย์', 'คุณโอ๊ต', 'คุณพลอย', 'คุณก้อง', 'คุณอ้อม', 'คุณเจ', 'คุณมิ้น', 'คุณนนท์', 'คุณแพร', 'คุณวิน', 'คุณน้ำ', 'คุณฟ้า', 'คุณโต้ง', 'คุณจูน', 'คุณกิ๊ฟ', 'คุณบี', 'คุณดรีม', 'คุณอาร์ม', 'คุณบาส']
    const locations = ['จุดรับสินค้า A', 'จุดรับสินค้า B', 'จุดรับสินค้า C']
    const itemSets: OrderItem[][] = [
      [{ name: 'ลูกชิ้นหมูพรีเมียม', quantity: 3 + index % 5, unit: 'ไม้', unitPrice: 15 }],
      [{ name: 'ไส้กรอกอีสานย่าง', quantity: 2 + index % 4, unit: 'ไม้', unitPrice: 15 }, { name: 'น้ำเก๊กฮวยเย็น', quantity: 1, unit: 'แก้ว', unitPrice: 25 }],
      [{ name: 'ลูกชิ้นเนื้อเอ็น', quantity: 2 + index % 5, unit: 'ไม้', unitPrice: 20 }, { name: 'ลูกชิ้นหมูพรีเมียม', quantity: 2, unit: 'ไม้', unitPrice: 15 }],
    ]
    return {
      id: `PO-200720-${String(index + 11).padStart(2, '0')}`,
      orderedAt: `20 ก.ค. 2569 13:${String(index * 3).padStart(2, '0')}`,
      deliveryDate: '2026-07-20',
      period: index % 2 === 0 ? 'morning' : 'afternoon',
      location: locations[index % locations.length],
      customerName: customers[index],
      phone: `08${String(10000000 + index * 371).padStart(8, '0')}`,
      lineId: `@customer_${index + 11}`,
      items: itemSets[index % itemSets.length],
      paymentStatus: 'จ่ายแล้ว',
      status: 'รอตรวจสอบ',
    }
  }),
]

export function getOrderTotal(order: AdminOrder) {
  return order.items.reduce((total, item) => total + item.quantity * item.unitPrice, 0)
}

export function getOrderListStatus(order: AdminOrder): OrderListStatus {
  return order.status
}

export function formatPrice(amount: number) {
  return `${amount.toLocaleString('th-TH')} บาท`
}

export function statusClass(status: OrderStatus | PaymentStatus) {
  if (status === 'รอชำระเงิน') return 'pending'
  if (status === 'ยกเลิก') return 'cancelled'
  if (status === 'พร้อมส่ง') return 'delivering'
  if (status === 'รอตรวจสอบ') return 'reviewing'
  if (status === 'เตรียมของ') return 'preparing'
  return 'success'
}
