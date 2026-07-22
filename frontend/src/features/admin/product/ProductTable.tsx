import { Check, ChevronLeft, ChevronRight, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { confirmAdminDelete } from '@/lib/confirm-admin-delete'
import { adminProducts } from './admin-products'

export function ProductTable() {
  const [products, setProducts] = useState(adminProducts)
  async function deleteProduct(productId: number, productName: string) {
    if (await confirmAdminDelete(productName)) setProducts((items) => items.filter((product) => product.id !== productId))
  }

  return <section className="admin-page product-page">
    <div className="admin-page-heading"><div><h1 className="admin-title">สินค้า</h1></div><Link to="/admin/products/add" className="admin-primary-button"><Plus size={19} />เพิ่มสินค้า</Link></div>
    <div className="product-table-wrap"><div className="product-table-scroll"><table className="product-table"><thead><tr><th>สินค้า</th><th>หมวดหมู่</th><th>ราคา</th><th>สต็อก</th><th>สถานะ</th><th>แสดง</th><th>จัดการ</th></tr></thead><tbody>{products.map((product) => <tr key={product.id}><td><div className="product-name"><img src={product.image} alt="" /><span><strong>{product.name}</strong><small>{product.detail}</small></span></div></td><td>{product.category}</td><td className="numeric">{product.price} บาท</td><td>{product.stock}</td><td><span className={`admin-status ${product.status === 'พร้อมขาย' ? 'available' : 'low'}`}>{product.status}</span></td><td><span className={`product-display-status ${product.isActive ? 'is-active' : 'is-inactive'}`} aria-label={product.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'} title={product.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}>{product.isActive ? <Check size={19} aria-hidden="true" /> : <X size={19} aria-hidden="true" />}</span></td><td><div className="product-actions"><Link className="product-edit" to={`/admin/products/${product.id}/edit`} aria-label={`แก้ไข ${product.name}`}><Pencil size={17} /></Link><button className="product-delete" type="button" aria-label={`ลบ ${product.name}`} onClick={() => deleteProduct(product.id, product.name)}><Trash2 size={17} /></button></div></td></tr>)}</tbody></table></div><div className="product-table-footer"><p>หน้า 1/3 จาก 42</p><nav aria-label="เปลี่ยนหน้าสินค้า"><button type="button" aria-label="หน้าก่อนหน้า"><ChevronLeft size={17} /></button><button className="active" type="button" aria-current="page">1</button><button type="button">2</button><button type="button">3</button><button type="button" aria-label="หน้าถัดไป"><ChevronRight size={17} /></button></nav></div></div>
  </section>
}
