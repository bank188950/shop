import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { confirmDelete } from '@/components/sweetalert2/confirm-delete'
import { AdminTablePagination } from '@/features/admin/shared/AdminTablePagination'
import type { AdminProduct } from './types'
import { useDeleteProduct, useProducts, useUpdateProduct } from './hooks/useProducts'

export function ProductTable() {
  const [page, setPage] = useState(1)
  const pageSize = 10
  const productsQuery = useProducts(page, pageSize)
  const deleteMutation = useDeleteProduct()
  const updateMutation = useUpdateProduct()
  const products = productsQuery.data?.data ?? []
  const meta = productsQuery.data?.meta

  async function toggleActive(product: AdminProduct) {
    try {
      await updateMutation.mutateAsync({
        productId: product.id,
        input: {
          name: product.name,
          description: product.description,
          categoryId: product.categoryId,
          unitId: product.unitId,
          salePrice: String(product.salePrice),
          stockQuantity: String(product.stockQuantity),
          stockPieceCount: String(product.stockPieceCount),
          piecesPerSale: String(product.piecesPerSale),
          lowStockThreshold: String(product.lowStockThreshold),
          isActive: !product.isActive,
          image: null,
        },
      })
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'ไม่สามารถเปลี่ยนสถานะการแสดงได้')
    }
  }

  async function deleteProduct(productId: number, productName: string) {
    if (!await confirmDelete(productName)) return
    try {
      await deleteMutation.mutateAsync(productId)
      if (products.length === 1 && page > 1) setPage((current) => current - 1)
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'ไม่สามารถลบสินค้าได้')
    }
  }

  return <section className="admin-page product-page">
    <div className="admin-page-heading"><div><h1 className="admin-title">สินค้า</h1></div><Link to="/admin/products/add" className="admin-primary-button"><Plus size={19} />เพิ่มสินค้า</Link></div>
    <div className="product-table-wrap"><div className="product-table-scroll"><table className="product-table"><thead><tr><th className="table-row-number">ลำดับ</th><th>สินค้า</th><th>หมวดหมู่</th><th>ราคา</th><th>สต็อก</th><th>สถานะ</th><th className="table-display-column">แสดง</th><th>จัดการ</th></tr></thead><tbody>{productsQuery.isLoading && <tr><td colSpan={8}>กำลังโหลดสินค้า...</td></tr>}{productsQuery.isError && <tr><td colSpan={8}>ไม่สามารถโหลดสินค้าได้: {productsQuery.error.message}</td></tr>}{!productsQuery.isLoading && !productsQuery.isError && products.length === 0 && <tr><td colSpan={8}>ยังไม่มีสินค้า</td></tr>}{products.map((product, index) => <tr key={product.id}><td className="table-row-number">{(page - 1) * pageSize + index + 1}</td><td><div className="product-name"><img src={product.imageUrl ?? '/images/logo.png'} alt={product.imageUrl ? product.name : ''} /><span><strong>{product.name}</strong><small>{product.description || '-'}</small></span></div></td><td>{product.categoryName}</td><td className="numeric">{product.salePrice} บาท</td><td>{product.stockQuantity} {product.unitName}</td><td><span className={`admin-status ${product.stockStatus === 'available' ? 'available' : 'low'}`}>{product.stockStatus === 'available' ? 'พร้อมขาย' : 'สต็อกต่ำ'}</span></td><td className="table-display-column"><button className={`product-display-status ${product.isActive ? 'is-active' : 'is-inactive'}`} type="button" disabled={updateMutation.isPending} aria-pressed={product.isActive} aria-label={`${product.isActive ? 'ปิด' : 'เปิด'}การแสดง ${product.name}`} onClick={() => toggleActive(product)}>{product.isActive ? <Check size={19} aria-hidden="true" /> : <X size={19} aria-hidden="true" />}</button></td><td><div className="product-actions"><Link className="product-edit" to={`/admin/products/${product.id}/edit`} aria-label={`แก้ไข ${product.name}`}><Pencil size={17} /></Link><button className="product-delete" type="button" disabled={deleteMutation.isPending} aria-label={`ลบ ${product.name}`} onClick={() => deleteProduct(product.id, product.name)}><Trash2 size={17} /></button></div></td></tr>)}</tbody></table></div>{meta && <AdminTablePagination currentPage={page} totalItems={meta.total} pageSize={pageSize} onPageChange={setPage} label="สินค้า" />}</div>
  </section>
}
