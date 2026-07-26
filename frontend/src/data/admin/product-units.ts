export type AdminProductUnit = {
  id: number
  name: string
}

const storageKey = 'admin-product-units'

const defaultUnits: AdminProductUnit[] = [
  { id: 1, name: 'ชิ้น' },
  { id: 2, name: 'ไม้' },
  { id: 3, name: 'กล่อง' },
  { id: 4, name: 'แพ็ก' },
  { id: 5, name: 'ถุง' },
  { id: 6, name: 'แก้ว' },
  { id: 7, name: 'ขวด' },
]

export function getProductUnits() {
  const savedUnits = window.sessionStorage.getItem(storageKey)
  if (!savedUnits) return defaultUnits

  try {
    return JSON.parse(savedUnits) as AdminProductUnit[]
  } catch {
    return defaultUnits
  }
}

export function saveProductUnits(units: AdminProductUnit[]) {
  window.sessionStorage.setItem(storageKey, JSON.stringify(units))
}
