import { useParams } from 'react-router-dom'
import { UnitForm } from '@/features/admin/unit/UnitForm'
import { getProductUnits } from '@/features/admin/unit/admin-units'

export function ProductUnitFormPage() {
  const { unitId } = useParams()
  const unit = getProductUnits().find((item) => item.id === Number(unitId))
  return <UnitForm unit={unit} />
}
