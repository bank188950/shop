import { useParams } from 'react-router-dom'
import { UserForm } from '@/features/admin/user/UserForm'
import { getAdminUsers } from '@/features/admin/user/admin-users'

export function UserFormPage() {
  const { userId } = useParams()
  const user = getAdminUsers().find((item) => item.id === Number(userId))
  return <UserForm user={user} />
}
