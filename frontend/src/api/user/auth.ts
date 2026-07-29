import api from '@/lib/axios'

export type UserAuth = {
  id: number
  name: string
  phone: string
  lineId: string
  locationId: number | null
  locationName: string
}

export type UserRegisterInput = {
  name: string
  phone: string
  lineId: string
  locationId: string
  password: string
  confirmPassword: string
}

export type UserLoginInput = { phone: string, password: string }

export async function getUserAuth() {
  const response = await api.get<{ data: UserAuth }>('/user/auth/me')
  return response.data.data
}

export async function registerUser(input: UserRegisterInput) {
  const body = new URLSearchParams({
    name: input.name.trim(),
    phone: input.phone.trim(),
    line_id: input.lineId.trim(),
    location_id: input.locationId,
    password: input.password,
    confirm_password: input.confirmPassword,
  })
  const response = await api.post<{ data: UserAuth }>('/user/auth/register', body)
  return response.data.data
}

export async function loginUser(input: UserLoginInput) {
  const body = new URLSearchParams({ phone: input.phone.trim(), password: input.password })
  const response = await api.post<{ data: UserAuth }>('/user/auth/login', body)
  return response.data.data
}

export async function logoutUser() {
  await api.post('/user/auth/logout')
}
