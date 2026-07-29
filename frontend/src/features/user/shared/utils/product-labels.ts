import type { UserProduct, UserProductStatus } from '@/api/user/products'

const badgeByStatus: Record<UserProductStatus, string> = {
  'in-stock': 'มีสินค้า',
  'low-stock': 'ใกล้หมด',
  'sold-out': 'หมดแล้ว',
}

export function productBadgeLabel(status: UserProductStatus) {
  return badgeByStatus[status]
}

export function productStockLabel(product: Pick<UserProduct, 'status' | 'stockQuantity' | 'unitName'>) {
  if (product.status === 'sold-out') return 'สินค้าหมด'
  return `เหลือ ${product.stockQuantity.toLocaleString('th-TH')} ${product.unitName}`
}

export function productPriceLabel(price: number) {
  return `${price.toLocaleString('th-TH')} บาท`
}
