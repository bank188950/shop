export type AdminLocation = {
  id: number
  name: string
  isActive: boolean
}

const storageKey = 'admin-pickup-locations'

const defaultLocations: AdminLocation[] = [
  { id: 1, name: 'จุดรับสินค้า A', isActive: true },
  { id: 2, name: 'จุดรับสินค้า B', isActive: true },
  { id: 3, name: 'จุดรับสินค้า C', isActive: true },
]

export function getLocations() {
  const savedLocations = window.sessionStorage.getItem(storageKey)
  if (!savedLocations) return defaultLocations

  try {
    return (JSON.parse(savedLocations) as AdminLocation[]).map((location) => ({ ...location, isActive: location.isActive ?? true }))
  } catch {
    return defaultLocations
  }
}

export function saveLocations(locations: AdminLocation[]) {
  window.sessionStorage.setItem(storageKey, JSON.stringify(locations))
}
