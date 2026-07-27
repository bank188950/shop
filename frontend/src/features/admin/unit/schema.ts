export type UnitFieldErrors = Partial<Record<'name', string>>

export function validateUnit(name: string): UnitFieldErrors {
  if (!name.trim()) return { name: 'กรุณาระบุชื่อหน่วยสินค้า' }
  return {}
}
