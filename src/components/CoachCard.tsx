import { useCoachInsight } from '../hooks/useMomentum'
import { Loader2, RefreshCw, Brain, CheckCircle2, Zap, AlertTriangle } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

interface CoachCardProps {
    dealId: string
}

export function CoachCard({ dealId }: CoachCardProps) {
    const { data, isLoading, isFetching } = useCoachInsight(dealId)
    const queryClient = useQueryClient()

    const refresh = () => {
        queryClient.invalidateQueries({ queryKey: ['momentum', 'coach', dealId] })
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
                <p className="text-sm">Generating coaching insights...</p>
            </div>
        )
    }

    const hasNoData = !data || (
        data.positives.length === 0 &&
        data.improvements.length === 0 &&
        data.risks.length === 0
    )

    if (hasNoData) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                <Brain className="h-8 w-8 text-gray-300" />
                <p className="text-sm font-medium text-gray-500">No coaching data yet</p>
                <p className="text-xs text-center max-w-xs">
                    Complete a meeting with a transcript or AI analysis to get personalized coaching tips.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-cyan-600" />
                    <h3 className="font-semibold text-gray-900">AI Coach Insight</h3>
                </div>
                <div className="flex items-center gap-2">
                    {data.meetingTitle && (
                        <span className="text-xs text-gray-400 truncate max-w-[160px]">
                            From: {data.meetingTitle}
                        </span>
                    )}
                    <button
                        onClick={refresh}
                        disabled={isFetching}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 transition-colors disabled:opacity-50"
                        title="Refresh coaching tips"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Positives */}
            {data.positives.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                            What went well
                        </span>
                    </div>
                    {data.positives.map((tip, i) => (
                        <p key={i} className="text-sm text-emerald-800 leading-relaxed">
                            {tip}
                        </p>
                    ))}
                </div>
            )}

            {/* Improvements */}
            {data.improvements.length > 0 && (
                <div className="bg-cyan-50 border border-cyan-100 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                        <Zap className="h-4 w-4 text-cyan-600" />
                        <span className="text-xs font-semibold text-cyan-700 uppercase tracking-wide">
                            Focus next call
                        </span>
                    </div>
                    {data.improvements.map((tip, i) => (
                        <p key={i} className="text-sm text-cyan-800 leading-relaxed">
                            {tip}
                        </p>
                    ))}
                </div>
            )}

            {/* Risks */}
            {data.risks.length > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                            Watch out
                        </span>
                    </div>
                    {data.risks.map((tip, i) => (
                        <p key={i} className="text-sm text-amber-800 leading-relaxed">
                            {tip}
                        </p>
                    ))}
                </div>
            )}

            {data.meetingDate && (
                <p className="text-[10px] text-gray-400 text-right">
                    Based on meeting from {new Date(data.meetingDate).toLocaleDateString()}
                </p>
            )}
        </div>
    )
}
