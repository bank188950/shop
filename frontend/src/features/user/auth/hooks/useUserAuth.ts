import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getUserAuth, loginUser, logoutUser, registerUser } from '@/api/user/auth'
import type { UserLoginInput, UserRegisterInput } from '@/api/user/auth'

export const userAuthKey = ['user', 'auth'] as const

export function useUserAuth() {
  return useQuery({ queryKey: userAuthKey, queryFn: getUserAuth, retry: false })
}

export function useUserRegister() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UserRegisterInput) => registerUser(input),
    onSuccess: (user) => queryClient.setQueryData(userAuthKey, user),
  })
}

export function useUserLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UserLoginInput) => loginUser(input),
    onSuccess: (user) => queryClient.setQueryData(userAuthKey, user),
  })
}

export function useUserLogout() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: logoutUser, onSuccess: () => queryClient.clear() })
}
