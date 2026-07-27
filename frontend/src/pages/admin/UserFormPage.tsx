import { useParams } from 'react-router-dom'
import { UserForm } from '@/features/admin/user/UserForm'

export function UserFormPage() {
  const { userId } = useParams()
  return <UserForm userId={userId ? Number(userId) : undefined} />
}
