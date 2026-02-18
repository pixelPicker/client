import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export interface Contact {
    _id: string
    name: string
    company: string
    email: string
    phone?: string
    dealStage: string
    dealValue: number
    dealScore: number
    lastContactedAt?: string
    nextFollowUp?: string
    sentiment?: 'positive' | 'neutral' | 'negative'
    painPoints: string[]
    objections: string[]
    notes: { content: string; createdAt: string }[]
    createdAt: string
    updatedAt: string
}

export interface PaginatedContacts {
    data: Contact[]
    total: number
    totalPages: number
    currentPage: number
}

export const useContacts = (search = '', page = 1, limit = 10) => {
    return useQuery({
        queryKey: ['contacts', search, page, limit],
        queryFn: async () => {
            const queryParams = new URLSearchParams({
                search,
                page: page.toString(),
                limit: limit.toString(),
            })
            const response = await api(`/contact?${queryParams}`)
            return response as unknown as PaginatedContacts
        },
    })
}

export const useContact = (id: string) => {
    return useQuery({
        queryKey: ['contact', id],
        queryFn: async () => {
            const response = await api(`/contact/${id}`)
            return response.data as Contact
        },
        enabled: !!id,
    })
}

export const useCreateContact = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (newContact: Partial<Contact>) => {
            const response = await api('/contact', {
                method: 'POST',
                body: JSON.stringify(newContact),
            })
            return response.data as Contact
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] })
        },
    })
}

export const useUpdateContact = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Contact> }) => {
            const response = await api(`/contact/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            })
            return response.data as Contact
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] })
            queryClient.invalidateQueries({ queryKey: ['contact'] })
        },
    })
}

export const useDeleteContact = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await api(`/contact/${id}`, {
                method: 'DELETE',
            })
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] })
        },
    })
}
