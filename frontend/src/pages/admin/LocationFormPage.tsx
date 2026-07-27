import { useParams } from 'react-router-dom'
import { LocationForm } from '@/features/admin/location/LocationForm'

export function LocationFormPage() {
  const { locationId } = useParams()
  return <LocationForm locationId={locationId ? Number(locationId) : undefined} />
}
