import api from '@/lib/axios'

export type AdminAuth = { username: string, name: string, role: 'super_admin', avatarUrl: string | null }
export type AdminLoginInput = { username: string, password: string, remember: boolean }

export async function getAdminAuth() {
  const response = await api.get<{ data: AdminAuth }>('/admin/auth/me')
  return response.data.data
}

export async function loginAdmin(input: AdminLoginInput) {
  const body = new URLSearchParams({ username: input.username.trim(), password: input.password, remember: input.remember ? '1' : '0' })
  const response = await api.post<{ data: AdminAuth }>('/admin/auth/login', body)
  return response.data.data
}

export async function logoutAdmin() {
  await api.post('/admin/auth/logout')
}
