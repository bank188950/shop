import { useParams } from 'react-router-dom'
import { CategoryForm } from '@/features/admin/category/CategoryForm'
import { getProductCategories } from '@/data/admin/product-categories'

export function ProductCategoryFormPage() {
  const { categoryId } = useParams()
  const category = getProductCategories().find((item) => item.id === Number(categoryId))
  return <CategoryForm category={category} />
}
