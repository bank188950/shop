import { useParams } from 'react-router-dom'
import { UnitForm } from '@/features/admin/unit/UnitForm'

export function ProductUnitFormPage() {
  const { unitId } = useParams()
  return <UnitForm unitId={unitId ? Number(unitId) : undefined} />
}
