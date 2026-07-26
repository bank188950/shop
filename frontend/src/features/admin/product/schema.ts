import type { ProductFormValues } from './types'

export function validateProduct(values: ProductFormValues) {
  if (!values.name.trim()) return 'กรุณาระบุชื่อสินค้า'
  if (!values.categoryId) return 'กรุณาเลือกหมวดสินค้า'
  if (!values.unitId) return 'กรุณาเลือกหน่วยสินค้า'

  const price = Number(values.salePrice)
  const quantity = Number(values.stockQuantity)
  const stock = Number(values.stockPieceCount)
  const piecesPerSale = Number(values.piecesPerSale)
  const lowStockThreshold = Number(values.lowStockThreshold)

  if (!Number.isFinite(price) || price < 0) return 'กรุณาระบุราคาตั้งแต่ 0 บาท'
  if (!Number.isInteger(quantity) || quantity < 0) return 'จำนวนสินค้าต้องเป็นจำนวนเต็มตั้งแต่ 0'
  if (!Number.isInteger(stock) || stock < 0) return 'จำนวนชิ้นต้องเป็นจำนวนเต็มตั้งแต่ 0'
  if (!Number.isInteger(piecesPerSale) || piecesPerSale < 1) return 'จำนวนชิ้นต่อ 1 สินค้าต้องมากกว่า 0'
  if (!Number.isInteger(lowStockThreshold) || lowStockThreshold < 0) return 'จุดแจ้งเตือนสต็อกต่ำต้องเป็นจำนวนเต็มตั้งแต่ 0'

  return ''
}
