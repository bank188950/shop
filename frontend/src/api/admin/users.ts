import api from '@/lib/axios'

export type AdminUser = { id: number, name: string, phone: string, lineId: string, locationId: number | null, locationName: string, isActive: boolean }
export type UserSaveInput = Omit<AdminUser, 'id' | 'locationName'> & { password: string, confirmPassword: string }

function userBody(input: UserSaveInput) { return new URLSearchParams({ name: input.name.trim(), phone: input.phone.trim(), line_id: input.lineId.trim(), location_id: String(input.locationId ?? ''), is_active: input.isActive ? '1' : '0', password: input.password, confirm_password: input.confirmPassword }) }
export async function getAdminUsers() { const response = await api.get<{ data: AdminUser[] }>('/admin/users'); return response.data.data }
export async function getAdminUser(userId: number) { const response = await api.get<{ data: AdminUser }>(`/admin/users/${userId}`); return response.data.data }
export async function createAdminUser(input: UserSaveInput) { const response = await api.post<{ data: AdminUser }>('/admin/users', userBody(input)); return response.data.data }
export async function updateAdminUser(userId: number, input: UserSaveInput) { const response = await api.post<{ data: AdminUser }>(`/admin/users/${userId}`, userBody(input)); return response.data.data }
export async function deleteAdminUser(userId: number) { await api.delete(`/admin/users/${userId}`) }
