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
      const response = await api(`/meeting?clientId=${clientId}`)
      return response.data as Meeting[]
    },
    enabled: !!clientId,
  })
}

export const useCreateMeeting = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newMeeting: Partial<Meeting>) => {
      const response = await api('/meeting', {
        method: 'POST',
        body: JSON.stringify(newMeeting),
      })
      return response.data as Meeting
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
    },
  })
}

export const useCalendar = () => {
  return useQuery({
    queryKey: ['calendar'],
    queryFn: async () => {
      const response = await api('/meeting/calendar')
      return response.data as Meeting[]
    },
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
