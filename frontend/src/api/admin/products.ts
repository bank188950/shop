import api from '@/lib/axios'
import type { ProductCategoryOption, ProductListResponse, ProductSaveInput, ProductUnitOption, AdminProduct } from '@/features/admin/product/types'

type ProductResponse = { data: AdminProduct }

function productFormData(input: ProductSaveInput) {
  const formData = new FormData()
  formData.append('name', input.name.trim())
  formData.append('description', input.description.trim())
  formData.append('category_id', String(input.categoryId))
  formData.append('unit_id', String(input.unitId))
  formData.append('sale_price', input.salePrice)
  formData.append('stock_piece_count', input.stockPieceCount)
  formData.append('pieces_per_sale', input.piecesPerSale)
  formData.append('low_stock_threshold', input.lowStockThreshold)
  formData.append('is_active', input.isActive ? '1' : '0')
  if (input.image) formData.append('image', input.image)
  return formData
}

export async function getProducts(page: number, perPage: number) {
  const response = await api.get<ProductListResponse>('/admin/products', { params: { page, per_page: perPage } })
  return response.data
}

export async function getProduct(productId: number) {
  const response = await api.get<ProductResponse>(`/admin/products/${productId}`)
  return response.data.data
}

export async function createProduct(input: ProductSaveInput) {
  const response = await api.post<ProductResponse>('/admin/products', productFormData(input))
  return response.data.data
}

export async function updateProduct(productId: number, input: ProductSaveInput) {
  const response = await api.post<ProductResponse>(`/admin/products/${productId}`, productFormData(input))
  return response.data.data
}

export async function deleteProduct(productId: number) {
  await api.delete(`/admin/products/${productId}`)
}

export async function getProductCategories() {
  const response = await api.get<{ data: Array<{ id: number, name: string, tracksQuantity: boolean }> }>('/admin/product-categories', { params: { active: 1 } })
  return response.data.data.map((category): ProductCategoryOption => ({ ...category, tracksPieceQuantity: category.tracksQuantity }))
}

export async function getProductUnits() {
  const response = await api.get<{ data: ProductUnitOption[] }>('/admin/product-units')
  return response.data.data
}
