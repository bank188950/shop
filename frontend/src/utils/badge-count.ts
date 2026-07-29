/** ตัวเลขบน badge ถ้าเกิน 99 ให้แสดง 99+ จะได้ไม่ล้นวงกลม */
export function badgeCountLabel(count: number) {
  return count > 99 ? '99+' : String(count)
}
