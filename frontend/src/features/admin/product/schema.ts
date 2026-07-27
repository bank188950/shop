import type { ProductFormValues } from './types'

export type ProductFieldErrors = Partial<Record<'name' | 'categoryId' | 'salePrice' | 'stockQuantity' | 'stockPieceCount' | 'piecesPerSale' | 'unitId' | 'lowStockThreshold', string>>

export function validateProduct(values: ProductFormValues, tracksPieceQuantity: boolean) {
  const errors: ProductFieldErrors = {}
  if (!values.name.trim()) errors.name = 'กรุณาระบุชื่อสินค้า'
  if (!values.categoryId) errors.categoryId = 'กรุณาเลือกหมวดสินค้า'
  if (!values.unitId) errors.unitId = 'กรุณาเลือกหน่วยสินค้า'
  if (!values.salePrice.trim() || !Number.isFinite(Number(values.salePrice))) errors.salePrice = 'กรุณาระบุราคาเป็นตัวเลข'

  if (tracksPieceQuantity) {
    if (!values.stockPieceCount.trim() || !Number.isFinite(Number(values.stockPieceCount))) errors.stockPieceCount = 'กรุณาระบุจำนวนชิ้นเป็นตัวเลข'
    if (!values.piecesPerSale.trim() || !Number.isFinite(Number(values.piecesPerSale))) errors.piecesPerSale = 'กรุณาระบุจำนวนชิ้นต่อสินค้าเป็นตัวเลข'
  } else if (!values.stockQuantity.trim() || !Number.isFinite(Number(values.stockQuantity))) {
    errors.stockQuantity = 'กรุณาระบุจำนวนสินค้าเป็นตัวเลข'
  }
  if (!values.lowStockThreshold.trim() || !Number.isFinite(Number(values.lowStockThreshold))) errors.lowStockThreshold = 'กรุณาระบุจุดแจ้งเตือนเป็นตัวเลข'

  return errors
}
