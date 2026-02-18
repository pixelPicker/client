import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

interface MomentumData {
    score: number
    level: 'Rising' | 'Active' | 'Quiet' | 'Inactive'
    emoji: string
    filledDots: number
    breakdown: {
        meetingsCompleted: number
        actionsApproved: number
        dealsProgressed: number
    }
    career: {
        xp: number
        level: number
        nextLevelXp: number
        currentLevelProgress: number
        totalMeetings: number
        totalActions: number
        totalDealsWon: number
    }
    achievements: Array<{
        id: string
        icon: string
        name: string
        description: string
        unlockedAt?: string
        locked?: boolean
    }>
}

interface StreaksData {
    followupStreak: number
    preparedCallStreak: number
    activeDealStreak: number
}

interface CoachInsightData {
    positives: string[]
    improvements: string[]
    risks: string[]
    meetingTitle?: string
    meetingDate?: string
}

export const useMomentum = () => {
    return useQuery({
        queryKey: ['momentum'],
        queryFn: async () => {
            const response = await api('/momentum')
            return response.data as MomentumData
        },
        refetchInterval: 5 * 60 * 1000,
        staleTime: 2 * 60 * 1000,
    })
}

export const useStreaks = () => {
    return useQuery({
        queryKey: ['momentum', 'streaks'],
        queryFn: async () => {
            const response = await api('/momentum/streaks')
            return response.data as StreaksData
        },
        refetchInterval: 5 * 60 * 1000,
        staleTime: 2 * 60 * 1000,
    })
}

export const useCoachInsight = (dealId: string) => {
    return useQuery({
        queryKey: ['momentum', 'coach', dealId],
        queryFn: async () => {
            const response = await api(`/momentum/coach/${dealId}`)
            return response.data as CoachInsightData
        },
        enabled: !!dealId,
        staleTime: 10 * 60 * 1000, // 10 min — coaching tips don't change often
    })
}
