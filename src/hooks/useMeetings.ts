import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export interface Meeting {
  _id: string
  clientId: string
  title: string
  date: string
  duration: number
  notes: string
  outcome?: string
  createdAt: string
  updatedAt: string
}

export const useMeetings = (clientId: string) => {
  return useQuery({
    queryKey: ['meetings', clientId],
    queryFn: async () => {
      const response = await api(`/meetings?clientId=${clientId}`)
      return response.data as Meeting[]
    },
    enabled: !!clientId,
  })
}

export interface Action {
  _id: string
  clientId: string
  title: string
  description: string
  dueDate?: string
  status: 'pending' | 'completed' | 'overdue'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  updatedAt: string
}

export const useActions = (clientId: string) => {
  return useQuery({
    queryKey: ['actions', clientId],
    queryFn: async () => {
      const response = await api(`/actions?clientId=${clientId}`)
      return response.data as Action[]
    },
    enabled: !!clientId,
  })
}
