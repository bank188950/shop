import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateCustomerProfile } from '@/api/user/profile'
import type { CustomerProfileInput } from '@/api/user/profile'
import { customerAuthKey } from '@/features/user/auth/hooks/useCustomerAuth'

export function useUpdateCustomerProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CustomerProfileInput) => updateCustomerProfile(input),
    onSuccess: (customer) => queryClient.setQueryData(customerAuthKey, customer),
  })
}
