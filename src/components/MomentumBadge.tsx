import { useMomentum } from '../hooks/useMomentum'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from './ui/tooltip'

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

export function MomentumBadge() {
    const { data, isLoading } = useMomentum()

    if (isLoading || !data) {
        return (
            <div className="h-8 w-28 rounded-full bg-gray-100 animate-pulse" />
        )
    }

    const style = LEVEL_STYLES[data.level] ?? LEVEL_STYLES.Inactive

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${style.bg} ${style.border} cursor-default select-none`}
                    >
                        {/* Emoji with optional pulse */}
                        <span
                            className={`text-sm ${style.pulse ? 'animate-pulse' : ''}`}
                        >
                            {data.emoji}
                        </span>

                        {/* Label */}
                        <span className={`text-xs font-semibold ${style.text}`}>
                            {data.level}
                        </span>

                        {/* Dot bar */}
                        <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-1.5 h-1.5 rounded-full transition-colors ${i < data.filledDots
                                        ? style.dot
                                        : 'bg-gray-200'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs space-y-1 p-3">
                    <p className="font-semibold text-white-800 mb-1">
                        Momentum Score: {data.score}
                    </p>
                    <p className="text-white-500">
                        🗓 Meetings completed:{' '}
                        <span className="font-medium text-white-700">
                            {data.breakdown.meetingsCompleted}
                        </span>{' '}
                        (+{data.breakdown.meetingsCompleted * 2} pts)
                    </p>
                    <p className="text-white-500">
                        ✅ Actions approved:{' '}
                        <span className="font-medium text-white-700">
                            {data.breakdown.actionsApproved}
                        </span>{' '}
                        (+{data.breakdown.actionsApproved * 3} pts)
                    </p>
                    <p className="text-white-500">
                        📈 Deals progressed:{' '}
                        <span className="font-medium text-white-700">
                            {data.breakdown.dealsProgressed}
                        </span>{' '}
                        (+{data.breakdown.dealsProgressed * 5} pts)
                    </p>
                    <p className="text-white-400 text-[10px] pt-1 border-t border-gray-100">
                        Based on last 7 days of activity
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
