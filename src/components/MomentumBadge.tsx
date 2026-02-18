import { useMomentum } from '../hooks/useMomentum'


const LEVEL_STYLES = {
    Rising: {
        bg: 'bg-cyan-50',
        border: 'border-cyan-200',
        text: 'text-cyan-700',
        dot: 'bg-cyan-500',
        pulse: true,
    },
    Active: {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        dot: 'bg-amber-500',
        pulse: false,
    },
    Quiet: {
        bg: 'bg-gray-100',
        border: 'border-gray-200',
        text: 'text-gray-500',
        dot: 'bg-gray-400',
        pulse: false,
    },
    Inactive: {
        bg: 'bg-gray-100',
        border: 'border-gray-200',
        text: 'text-gray-400',
        dot: 'bg-gray-300',
        pulse: false,
    },
}

import { useState } from 'react'
import { GamificationModal } from './GamificationModal'

export function MomentumBadge() {
    const { data, isLoading } = useMomentum()
    const [isModalOpen, setIsModalOpen] = useState(false)

    if (isLoading || !data) {
        return (
            <div className="h-8 w-28 rounded-full bg-gray-100 animate-pulse" />
        )
    }

    const { career } = data
    const style = LEVEL_STYLES[data.level] ?? LEVEL_STYLES.Inactive

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${style.bg} ${style.border} hover:shadow-md transition-all active:scale-95`}
            >
                {/* Career Level Circle */}
                <div className="relative w-6 h-6 flex items-center justify-center">
                    <svg className="absolute w-full h-full -rotate-90">
                        <circle
                            cx="12"
                            cy="12"
                            r="10"
                            fill="none"
                            className="stroke-gray-200"
                            strokeWidth="2"
                        />
                        <circle
                            cx="12"
                            cy="12"
                            r="10"
                            fill="none"
                            className="stroke-cyan-500"
                            strokeWidth="2"
                            strokeDasharray={`${(career.currentLevelProgress / career.nextLevelXp) * 63} 63`}
                            strokeLinecap="round"
                        />
                    </svg>
                    <span className="text-[9px] font-bold text-gray-700 relative z-10">{career.level}</span>
                </div>

                {/* Weekly Status Emoji */}
                <span
                    className={`text-sm ${style.pulse ? 'animate-pulse' : ''}`}
                >
                    {data.emoji}
                </span>

                {/* Momentum Label (Hidden on mobile if needed, but kept for now) */}
                <span className={`text-xs font-semibold ${style.text} hidden sm:inline`}>
                    {data.level}
                </span>
            </button>

            <GamificationModal open={isModalOpen} onOpenChange={setIsModalOpen} />
        </>
    )
}
