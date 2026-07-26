import { useParams } from 'react-router-dom'
import { CategoryForm } from '@/features/admin/category/CategoryForm'

export function ProductCategoryFormPage() {
  const { categoryId } = useParams()
  return <CategoryForm categoryId={categoryId ? Number(categoryId) : undefined} />
}
