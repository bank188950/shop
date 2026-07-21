import { useParams } from 'react-router-dom'
import { CategoryForm } from '@/features/admin/category/CategoryForm'
import { getProductCategories } from '@/features/admin/category/admin-categories'

export function ProductCategoryFormPage() {
  const { categoryId } = useParams()
  const category = getProductCategories().find((item) => item.id === Number(categoryId))
  return <CategoryForm category={category} />
}
