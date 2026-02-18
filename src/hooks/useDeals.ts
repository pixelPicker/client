import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export interface Deal {
    _id: string
    clientId: {
        _id: string
        name: string
        company: string
    }
    title: string
    stage: 'Lead' | 'Discovery' | 'Qualified' | 'Proposal Sent' | 'Negotiation' | 'Closed Won' | 'Closed Lost'
    value: number
    status: 'active' | 'inactive' | 'closed'
    lastActivity?: string
    createdAt: string
    updatedAt: string
}

export interface PaginatedDeals {
    data: Deal[]
    total: number
    totalPages: number
    currentPage: number
}

export const useDeals = (search = '', page = 1, stage = 'all', limit = 10, clientId = '') => {
    return useQuery({
        queryKey: ['deals', search, page, stage, limit, clientId],
        queryFn: async () => {
            const queryParams = new URLSearchParams({
                search,
                page: page.toString(),
                limit: limit.toString(),
            })
            if (stage && stage !== 'all') {
                queryParams.append('stage', stage)
            }
            if (clientId) {
                queryParams.append('clientId', clientId)
            }
            const response = await api(`/deal?${queryParams}`)
            return response as unknown as PaginatedDeals
        },
    })
}

export const useDeal = (id: string) => {
    return useQuery({
        queryKey: ['deal', id],
        queryFn: async () => {
            const response = await api(`/deal/${id}`)
            return response.data as Deal
        },
        enabled: !!id,
    })
}

export const useCreateDeal = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (newDeal: Partial<Deal>) => {
            const response = await api('/deal', {
                method: 'POST',
                body: JSON.stringify(newDeal),
            })
            return response.data as Deal
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deals'] })
        },
    })
}

export const useUpdateDeal = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Deal> }) => {
            const response = await api(`/deal/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            })
            return response.data as Deal
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deals'] })
            queryClient.invalidateQueries({ queryKey: ['deal'] })
        },
    })
}

export const useDeleteDeal = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await api(`/deal/${id}`, {
                method: 'DELETE',
            })
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deals'] })
        },
    })
}
