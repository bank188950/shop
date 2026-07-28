import api from '@/lib/axios'

export type CustomerAuth = {
  id: number
  name: string
  phone: string
  lineId: string
  locationId: number | null
  locationName: string
}

export type CustomerRegisterInput = {
  name: string
  phone: string
  lineId: string
  locationId: string
  password: string
  confirmPassword: string
}

export type CustomerLoginInput = { phone: string, password: string }

export async function getCustomerAuth() {
  const response = await api.get<{ data: CustomerAuth }>('/user/auth/me')
  return response.data.data
}

export async function registerCustomer(input: CustomerRegisterInput) {
  const body = new URLSearchParams({
    name: input.name.trim(),
    phone: input.phone.trim(),
    line_id: input.lineId.trim(),
    location_id: input.locationId,
    password: input.password,
    confirm_password: input.confirmPassword,
  })
  const response = await api.post<{ data: CustomerAuth }>('/user/auth/register', body)
  return response.data.data
}

export async function loginCustomer(input: CustomerLoginInput) {
  const body = new URLSearchParams({ phone: input.phone.trim(), password: input.password })
  const response = await api.post<{ data: CustomerAuth }>('/user/auth/login', body)
  return response.data.data
}

export async function logoutCustomer() {
  await api.post('/user/auth/logout')
}
