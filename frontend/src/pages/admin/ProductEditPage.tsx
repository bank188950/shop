import { useParams } from 'react-router-dom'
import { ProductForm } from '@/features/admin/product/ProductForm'

export function ProductEditPage() {
  const { productId } = useParams()
  return <ProductForm productId={productId ? Number(productId) : undefined} />
}
