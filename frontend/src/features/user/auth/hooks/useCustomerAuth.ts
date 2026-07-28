import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getCustomerAuth, loginCustomer, logoutCustomer, registerCustomer } from '@/api/user/auth'
import type { CustomerLoginInput, CustomerRegisterInput } from '@/api/user/auth'

export const customerAuthKey = ['user', 'auth'] as const

export function useCustomerAuth() {
  return useQuery({ queryKey: customerAuthKey, queryFn: getCustomerAuth, retry: false })
}

export function useCustomerRegister() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CustomerRegisterInput) => registerCustomer(input),
    onSuccess: (customer) => queryClient.setQueryData(customerAuthKey, customer),
  })
}

export function useCustomerLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CustomerLoginInput) => loginCustomer(input),
    onSuccess: (customer) => queryClient.setQueryData(customerAuthKey, customer),
  })
}

export function useCustomerLogout() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: logoutCustomer, onSuccess: () => queryClient.clear() })
}
