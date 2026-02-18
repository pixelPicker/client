import { useStreaks } from '../hooks/useMomentum'
import { Flame } from 'lucide-react'

interface StreakCardProps {
    icon: string
    label: string
    value: number
    unit: string
    hot: boolean
}

function StreakCard({ icon, label, value, unit, hot }: StreakCardProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">{label}</span>
                {hot && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                        <Flame className="h-3 w-3" />
                        Hot
                    </span>
                )}
            </div>
            <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-gray-900 leading-none">
                    {icon} {value}
                </span>
            </div>
            <p className="text-xs text-gray-400">{unit}</p>
        </div>
    )
}

export function StreaksPanel() {
    const { data, isLoading } = useStreaks()

    if (isLoading) {
        return (
            <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />
                ))}
            </div>
        )
    }

    if (!data) return null

    const streaks = [
        {
            icon: '🔁',
            label: 'Follow-up Streak',
            value: data.followupStreak,
            unit: 'consecutive days with follow-ups',
            hot: data.followupStreak >= 3,
        },
        {
            icon: '📞',
            label: 'Prepared Calls',
            value: data.preparedCallStreak,
            unit: 'meetings with notes in a row',
            hot: data.preparedCallStreak >= 3,
        },
        {
            icon: '⚡',
            label: 'Active Days',
            value: data.activeDealStreak,
            unit: 'consecutive days of activity',
            hot: data.activeDealStreak >= 3,
        },
    ]

    return (
        <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Activity Streaks
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {streaks.map((s) => (
                    <StreakCard key={s.label} {...s} />
                ))}
            </div>
        </div>
    )
}
