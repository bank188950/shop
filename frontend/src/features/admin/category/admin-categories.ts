export type AdminProductCategory = {
  id: number
  name: string
  tracksQuantity: boolean
}

const storageKey = 'admin-product-categories'

const defaultCategories: AdminProductCategory[] = [
  { id: 1, name: 'ลูกชิ้น', tracksQuantity: true },
  { id: 2, name: 'ไส้กรอก', tracksQuantity: true },
  { id: 3, name: 'เครื่องดื่ม', tracksQuantity: false },
]

export function getProductCategories() {
  const savedCategories = window.sessionStorage.getItem(storageKey)
  if (!savedCategories) return defaultCategories

  try {
    const categories = JSON.parse(savedCategories) as AdminProductCategory[]
    if (!categories.length) return defaultCategories
    return categories.map((category) => ({ ...category, tracksQuantity: category.tracksQuantity ?? false }))
  } catch {
    return defaultCategories
  }
}

export function saveProductCategories(categories: AdminProductCategory[]) {
  window.sessionStorage.setItem(storageKey, JSON.stringify(categories))
}
