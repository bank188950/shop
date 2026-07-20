import { ChevronLeft, ChevronRight, CircleAlert, Pencil, Plus, ShoppingBasket, TrendingUp, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { adminProducts } from './admin-products'

const metrics = [
  { label: 'สินค้าทั้งหมด', value: '42 รายการ', icon: ShoppingBasket, tone: 'mint' },
  { label: 'สต็อกต่ำ', value: '5 รายการ', icon: TriangleAlert, tone: 'peach' },
  { label: 'ขายดี', value: 'ลูกชิ้นหมู', icon: TrendingUp, tone: 'green' },
  { label: 'รายได้วันนี้', value: '12,450 บาท', icon: CircleAlert, tone: 'rose' },
]

export function ProductTable() {
  return <section className="admin-page product-page">
    <div className="admin-page-heading"><div><p className="admin-kicker">คลังสินค้า</p><h1 className="admin-title">สินค้า</h1></div><Link to="/admin/products/new" className="admin-primary-button"><Plus size={19} />เพิ่มสินค้า</Link></div>
    <div className="product-metrics">{metrics.map(({ label, value, icon: Icon, tone }) => <article key={label}><span className={`product-metric-icon ${tone}`}><Icon size={21} /></span><div><small>{label}</small><strong>{value}</strong></div></article>)}</div>
    <div className="product-table-wrap"><div className="product-table-scroll"><table className="product-table"><thead><tr><th>สินค้า</th><th>หมวดหมู่</th><th>ราคา</th><th>สต็อก</th><th>สถานะ</th><th><span className="sr-only">จัดการ</span></th></tr></thead><tbody>{adminProducts.map((product) => <tr key={product.id}><td><div className="product-name"><img src={product.image} alt="" /><span><strong>{product.name}</strong><small>{product.detail}</small></span></div></td><td>{product.category}</td><td className="numeric">{product.price} บาท</td><td>{product.stock}</td><td><span className={`admin-status ${product.status === 'พร้อมขาย' ? 'available' : 'low'}`}>{product.status}</span></td><td><button className="product-edit" type="button" aria-label={`แก้ไข ${product.name}`}><Pencil size={17} /></button></td></tr>)}</tbody></table></div><div className="product-table-footer"><p>หน้า 1/3 จาก 42</p><nav aria-label="เปลี่ยนหน้าสินค้า"><button type="button" aria-label="หน้าก่อนหน้า"><ChevronLeft size={17} /></button><button className="active" type="button" aria-current="page">1</button><button type="button">2</button><button type="button">3</button><button type="button" aria-label="หน้าถัดไป"><ChevronRight size={17} /></button></nav></div></div>
  </section>
}
