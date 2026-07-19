export type AdminProduct = {
  id: number
  name: string
  detail: string
  category: string
  price: number
  stock: string
  status: 'พร้อมขาย' | 'สต็อกต่ำ'
  image: string
}

export const adminProducts: AdminProduct[] = [
  { id: 1, name: 'ลูกชิ้นหมูพรีเมียม', detail: 'ไม้ละ 3 ลูก', category: 'ลูกชิ้น', price: 15, stock: '120 ไม้', status: 'พร้อมขาย', image: '/images/product-pork-premium.png' },
  { id: 2, name: 'ไส้กรอกรมควัน', detail: 'ไม้ละ 2 ชิ้น', category: 'ไส้กรอก', price: 20, stock: '45 ไม้', status: 'สต็อกต่ำ', image: '/images/product-isan-sausage.png' },
  { id: 3, name: 'น้ำเก๊กฮวยเย็น', detail: 'แก้ว 16 ออนซ์', category: 'เครื่องดื่ม', price: 25, stock: '80 แก้ว', status: 'พร้อมขาย', image: '/images/product-chrysanthemum.png' },
]
