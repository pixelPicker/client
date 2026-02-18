import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { api } from '../lib/api'

export const useUser = () => {
    return useQuery({
        queryKey: ['user'],
        queryFn: () => api('/auth/me'),
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export const useLogin = () => {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    return useMutation({
        mutationFn: async (credentials: any) => {
            const data = await api('/auth/login', {
                method: 'POST',
                body: JSON.stringify(credentials),
            })
            return data
        },
        onSuccess: (data) => {
            localStorage.setItem('token', data.token)
            queryClient.invalidateQueries({ queryKey: ['user'] })
            navigate({ to: '/dashboard' })
        },
    })
}

export const useRegister = () => {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    return useMutation({
        mutationFn: async (userData: any) => {
            const data = await api('/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData),
            })
            return data
        },
        onSuccess: (data) => {
            localStorage.setItem('token', data.token)
            queryClient.invalidateQueries({ queryKey: ['user'] })
            navigate({ to: '/dashboard' })
        },
    })
}

export const useLogout = () => {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    return () => {
        localStorage.removeItem('token')
        queryClient.removeQueries() // Clear all cache to prevent data leakage between users
        queryClient.setQueryData(['user'], null)
        navigate({ to: '/login' })
    }
}
