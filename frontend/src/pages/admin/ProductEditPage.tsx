import { useParams } from 'react-router-dom'
import { ProductForm } from '@/features/admin/product/ProductForm'
import { adminProducts } from '@/features/admin/product/admin-products'

export function ProductEditPage() {
  const { productId } = useParams()
  const product = adminProducts.find((item) => item.id === Number(productId))
  return <ProductForm product={product} />
}
