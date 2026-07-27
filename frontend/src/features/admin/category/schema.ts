export type CategoryFieldErrors = Partial<Record<'name', string>>

export function validateCategory(name: string): CategoryFieldErrors {
  if (!name.trim()) return { name: 'กรุณาระบุชื่อหมวดสินค้า' }
  return {}
}
