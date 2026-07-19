export type Product = {
  id: number
  name: string
  stockLabel: string
  price: number
  badge: string
  status: 'in-stock' | 'low-stock' | 'sold-out'
  image: string
  description: string
}

export const products: Product[] = [
  { id: 1, name: 'ไส้กรอกอีสานย่าง', stockLabel: 'เหลือ 25 ไม้', price: 15, badge: 'มีสินค้า', status: 'in-stock', image: '/images/product-isan-sausage.png', description: 'ไส้กรอกอีสานสูตรโบราณ หมักข้าวจนได้ที่ รสเปรี้ยวกลมกล่อม ย่างเตาถ่านหอมกรุ่น เสิร์ฟพร้อมกะหล่ำ ขิงสด และพริกขี้หนู' },
  { id: 2, name: 'ลูกชิ้นเนื้อเอ็น', stockLabel: 'เหลือ 16 ไม้', price: 20, badge: 'มีสินค้า', status: 'in-stock', image: '/images/product-beef-tendon.png', description: 'ลูกชิ้นเนื้อวัวแท้ผสมเอ็นหนึบ เด้งเต็มคำ ต้มในน้ำซุปร้อน หอมเครื่องเทศ เสิร์ฟพร้อมน้ำจิ้มสูตรพิเศษ' },
  { id: 3, name: 'น้ำเก๊กฮวยเย็น', stockLabel: 'เหลือ 5 แก้ว', price: 25, badge: 'ใกล้หมด', status: 'low-stock', image: '/images/product-chrysanthemum.png', description: 'น้ำเก๊กฮวยต้มสดใหม่ทุกวัน หวานน้อย ชื่นใจ ช่วยดับร้อน เสิร์ฟเย็นเจี๊ยบพร้อมน้ำแข็ง' },
  { id: 4, name: 'ลูกชิ้นปลาระเบิด', stockLabel: 'สินค้าหมด', price: 15, badge: 'หมดแล้ว', status: 'sold-out', image: '/images/product-fish-balls.png', description: 'ลูกชิ้นปลาสอดไส้ กัดคำแรกระเบิดความอร่อยเต็มปาก เนื้อแน่นเด้ง ทอดกรอบนอกนุ่มใน' },
]

export const productCategories = ['ทั้งหมด', 'ลูกชิ้นทอด', 'เครื่องดื่ม']
