export type AdminUser = {
  id: number
  name: string
  phone: string
  lineId: string
  location: string
  isActive: boolean
}

const storageKey = 'lookchin-admin-users-v1'

export const defaultAdminUsers: AdminUser[] = [
  { id: 1, name: 'คุณบอม', phone: '0812345678', lineId: '@bom_eats', location: 'จุดรับสินค้า A', isActive: true },
  { id: 2, name: 'คุณฝน', phone: '0892223344', lineId: '@fon_line', location: 'จุดรับสินค้า A', isActive: true },
  { id: 3, name: 'คุณต้น', phone: '0825556677', lineId: '@ton_food', location: 'จุดรับสินค้า B', isActive: true },
  { id: 4, name: 'คุณแอน', phone: '0918889900', lineId: '@ann_food', location: 'จุดรับสินค้า A', isActive: true },
  { id: 5, name: 'คุณกอล์ฟ', phone: '0843334455', lineId: '@golf_golf', location: 'จุดรับสินค้า C', isActive: true },
  { id: 6, name: 'คุณเมย์', phone: '0805556611', lineId: '@may_order', location: 'จุดรับสินค้า B', isActive: false },
  { id: 7, name: 'คุณปาล์ม', phone: '0824447788', lineId: '@palm_food', location: 'จุดรับสินค้า C', isActive: true },
  { id: 8, name: 'คุณนิด', phone: '0867778899', lineId: '@nid_day', location: 'จุดรับสินค้า A', isActive: true },
  { id: 9, name: 'คุณจอย', phone: '0831112233', lineId: '@joy_snack', location: 'จุดรับสินค้า B', isActive: true },
  { id: 10, name: 'คุณอาร์ต', phone: '0876665544', lineId: '@art_grill', location: 'จุดรับสินค้า C', isActive: true },
]

export function getAdminUsers(): AdminUser[] {
  try {
    const saved = window.localStorage.getItem(storageKey)
    if (saved) return JSON.parse(saved) as AdminUser[]
  } catch {
    // Use the default sample users when browser storage is unavailable.
  }
  return defaultAdminUsers
}

export function saveAdminUsers(users: AdminUser[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(users))
}
