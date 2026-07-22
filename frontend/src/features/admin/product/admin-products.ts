export type AdminProduct = {
  id: number
  name: string
  detail: string
  category: string
  price: number
  pieceCount: number
  piecesPerStick: number
  unit: string
  stock: string
  lowStockThreshold: number
  status: 'พร้อมขาย' | 'สต็อกต่ำ'
  isActive: boolean
  image: string
}

export const adminProducts: AdminProduct[] = [
  { id: 1, name: 'ลูกชิ้นหมูพรีเมียม', detail: 'ไม้ละ 3 ลูก', category: 'ลูกชิ้น', price: 15, pieceCount: 360, piecesPerStick: 3, unit: 'ไม้', stock: '120 ไม้', lowStockThreshold: 5, status: 'พร้อมขาย', isActive: true, image: '/images/product-pork-premium.png' },
  { id: 2, name: 'ไส้กรอกรมควัน', detail: 'ไม้ละ 2 ชิ้น', category: 'ไส้กรอก', price: 20, pieceCount: 90, piecesPerStick: 2, unit: 'ไม้', stock: '45 ไม้', lowStockThreshold: 5, status: 'สต็อกต่ำ', isActive: true, image: '/images/product-isan-sausage.png' },
  { id: 3, name: 'น้ำเก๊กฮวยเย็น', detail: 'แก้ว 16 ออนซ์', category: 'เครื่องดื่ม', price: 25, pieceCount: 80, piecesPerStick: 1, unit: 'แก้ว', stock: '80 แก้ว', lowStockThreshold: 5, status: 'พร้อมขาย', isActive: true, image: '/images/product-chrysanthemum.png' },
]
