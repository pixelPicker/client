import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export interface Meeting {
  _id: string
  title: string
  clientId: string
  dealId?: string
  dateTime: string
  transcript: string
  aiSummary: string
  aiInsights: any
  participants: string[]
  createdAt: string
  updatedAt: string
}

export const useMeetings = (clientId?: string, dealId?: string) => {
  return useQuery({
    queryKey: ['meetings', clientId || dealId],
    queryFn: async () => {
      const params = dealId ? `dealId=${dealId}` : `clientId=${clientId}`
      const response = await api(`/meeting?${params}`)
      return response.data as Meeting[]
    },
    enabled: !!(clientId || dealId),
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
  meetingId: string
  clientId: string
  dealId?: string
  type: string
  title: string
  description: string
  suggestedData: any
  status: 'pending' | 'completed' | 'overdue'
  source: 'ai' | 'manual'
  priority: 'low' | 'medium' | 'high'
  userId: string
  createdAt: string
  updatedAt: string
}

export const useActions = (clientId?: string, dealId?: string) => {
  return useQuery({
    queryKey: ['actions', clientId || dealId],
    queryFn: async () => {
      const params = dealId ? `dealId=${dealId}` : `clientId=${clientId}`
      const response = await api(`/action?${params}`)
      return response.data as Action[]
    },
    enabled: !!(clientId || dealId),
  })
}

export const useMeeting = (id: string) => {
  return useQuery({
    queryKey: ['meeting', id],
    queryFn: async () => {
      const response = await api(`/meeting/${id}`)
      return response.data as Meeting
    },
    enabled: !!id,
  })
}
