export type AdminLocation = {
  id: number
  name: string
}

const storageKey = 'admin-pickup-locations'

const defaultLocations: AdminLocation[] = [
  { id: 1, name: 'จุดรับสินค้า A' },
  { id: 2, name: 'จุดรับสินค้า B' },
  { id: 3, name: 'จุดรับสินค้า C' },
]

export function getLocations() {
  const savedLocations = window.sessionStorage.getItem(storageKey)
  if (!savedLocations) return defaultLocations

  try {
    return JSON.parse(savedLocations) as AdminLocation[]
  } catch {
    return defaultLocations
  }
}

export function saveLocations(locations: AdminLocation[]) {
  window.sessionStorage.setItem(storageKey, JSON.stringify(locations))
}
