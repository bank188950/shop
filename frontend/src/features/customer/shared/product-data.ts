export type Product = {
  id: number
  name: string
  stockLabel: string
  price: number
  badge: string
  status: 'in-stock' | 'low-stock' | 'sold-out'
  image: string
}

export const products: Product[] = [
  { id: 1, name: 'ไส้กรอกอีสานย่าง', stockLabel: 'เหลือ 25 ไม้', price: 15, badge: 'มีสินค้า', status: 'in-stock', image: '/images/product-isan-sausage.png' },
  { id: 2, name: 'ลูกชิ้นเนื้อเอ็น', stockLabel: 'เหลือ 16 ไม้', price: 20, badge: 'มีสินค้า', status: 'in-stock', image: '/images/product-beef-tendon.png' },
  { id: 3, name: 'น้ำเก๊กฮวยเย็น', stockLabel: 'เหลือ 5 แก้ว', price: 25, badge: 'ใกล้หมด', status: 'low-stock', image: '/images/product-chrysanthemum.png' },
  { id: 4, name: 'ลูกชิ้นปลาระเบิด', stockLabel: 'สินค้าหมด', price: 15, badge: 'หมดแล้ว', status: 'sold-out', image: '/images/product-fish-balls.png' },
]

export const productCategories = ['ทั้งหมด', 'ลูกชิ้นทอด', 'เครื่องดื่ม']
