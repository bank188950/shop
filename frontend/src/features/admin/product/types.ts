export type AdminProduct = {
  id: number
  name: string
  description: string
  imageUrl: string | null
  categoryId: number
  categoryName: string
  tracksPieceQuantity: boolean
  unitId: number
  unitName: string
  salePrice: number
  stockPieceCount: number
  stockQuantity: number
  piecesPerSale: number
  lowStockThreshold: number
  isActive: boolean
  stockStatus: 'available' | 'low'
}

export type ProductCategoryOption = {
  id: number
  name: string
  tracksPieceQuantity: boolean
}

export type ProductUnitOption = {
  id: number
  name: string
}

export type ProductFormValues = {
  name: string
  description: string
  categoryId: number | null
  unitId: number | null
  salePrice: string
  stockQuantity: string
  stockPieceCount: string
  piecesPerSale: string
  lowStockThreshold: string
  isActive: boolean
}

export type ProductSaveInput = ProductFormValues & {
  image: File | null
}

export type ProductListResponse = {
  data: AdminProduct[]
  meta: {
    page: number
    perPage: number
    total: number
    totalPages: number
    lowStock: number
  }
}
