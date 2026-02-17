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

export const useContacts = () => {
    return useQuery({
        queryKey: ['contacts'],
        queryFn: async () => {
            const response = await api('/contact')
            return response.data as Contact[]
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
