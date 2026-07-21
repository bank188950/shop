import { useParams } from 'react-router-dom'
import { LocationForm } from '@/features/admin/location/LocationForm'
import { getLocations } from '@/features/admin/location/admin-locations'

export function LocationFormPage() {
  const { locationId } = useParams()
  const location = getLocations().find((item) => item.id === Number(locationId))
  return <LocationForm location={location} />
}
