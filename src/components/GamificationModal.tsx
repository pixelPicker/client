import { useMomentum, useStreaks } from '../hooks/useMomentum'
import {
    Dialog,
    DialogContent,
} from './ui/dialog'
import { Progress } from './ui/progress'
import { Trophy, Star, Flame, Calendar, MapPin, Zap, Lock, Medal } from 'lucide-react'

interface GamificationModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function GamificationModal({ open, onOpenChange }: GamificationModalProps) {
    const { data: momentum } = useMomentum()
    const { data: streaks } = useStreaks()

    if (!momentum) return null

    const { career, achievements } = momentum
    const progressPercentage = (career.currentLevelProgress / career.nextLevelXp) * 100

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[600px] p-0 overflow-hidden flex gap-0 border-0 rounded-2xl shadow-2xl">
                {/* Left Panel: Profile & Stats (Dark Gradient) */}
                <div className="w-[35%] bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 flex flex-col justify-between relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-cyan-400 font-medium text-xs uppercase tracking-widest mb-6">
                            <Star className="w-3 h-3" />
                            Career Profile
                        </div>

                        <div className="text-center mb-8">
                            <div className="relative w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                                {/* Level Ring */}
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="64" cy="64" r="60" fill="none" stroke="currentColor" className="text-slate-700" strokeWidth="4" />
                                    <circle
                                        cx="64" cy="64" r="60" fill="none" stroke="currentColor"
                                        className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                                        strokeWidth="4"
                                        strokeDasharray={`${(progressPercentage / 100) * 377} 377`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-5xl font-bold">{career.level}</span>
                                    <span className="text-xs text-slate-400 font-medium uppercase mt-1">Level</span>
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-1">{Math.round(career.xp).toLocaleString()} XP</h2>
                            <p className="text-slate-400 text-xs text-center px-4">
                                {Math.round(career.nextLevelXp - career.currentLevelProgress)} XP to next level
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4 relative z-10 w-full">
                        <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-slate-400">Current Momentum</span>
                                <span className="text-xs font-bold text-emerald-400">{momentum.level}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">{momentum.emoji}</span>
                                <div className="flex-1">
                                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div
                                                key={i}
                                                className={`flex-1 rounded-full ${i <= momentum.filledDots ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-1.5 text-right">Last 7 Days Activity</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Content (White/Light) */}
                <div className="w-[65%] bg-white p-8 flex flex-col overflow-hidden">
                    {/* Streaks Row */}
                    <div className="mb-8">
                        <h3 className="text-gray-900 font-bold text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
                            <Flame className="w-4 h-4 text-orange-500" />
                            Current Streaks
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            {streaks && (
                                <>
                                    <StreakCard icon="🔁" value={streaks.followupStreak} label="Follow-ups" color="bg-orange-50 text-orange-700 border-orange-100" />
                                    <StreakCard icon="📞" value={streaks.preparedCallStreak} label="Prepared" color="bg-blue-50 text-blue-700 border-blue-100" />
                                    <StreakCard icon="⚡" value={streaks.activeDealStreak} label="Active Days" color="bg-purple-50 text-purple-700 border-purple-100" />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Achievements Grid */}
                    <div className="flex-1 overflow-hidden flex flex-col">
                        <h3 className="text-gray-900 font-bold text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            Achievements
                        </h3>

                        <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3">
                            {achievements.map((ach) => (
                                <div
                                    key={ach.id}
                                    className={`group flex items-center gap-4 p-3 rounded-xl border transition-all duration-200 ${ach.locked
                                        ? 'bg-gray-50 border-gray-100 opacity-60 grayscale'
                                        : 'bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-cyan-100 hover:bg-cyan-50/30'}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm ${ach.locked ? 'bg-gray-200 text-gray-400' : 'bg-gradient-to-br from-white to-gray-50 border border-gray-100'}`}>
                                        {ach.locked ? <Lock className="w-4 h-4" /> : ach.icon}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <h4 className={`font-bold text-sm truncate ${ach.locked ? 'text-gray-500' : 'text-gray-900'}`}>
                                                {ach.name}
                                            </h4>
                                            {!ach.locked && ach.unlockedAt && (
                                                <span className="text-[10px] font-medium text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-full">
                                                    {new Date(ach.unlockedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">{ach.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function StreakCard({ icon, value, label, color }: { icon: string, value: number, label: string, color: string }) {
    return (
        <div className={`rounded-xl border p-3 flex flex-col items-center justify-center text-center ${color}`}>
            <span className="text-xl font-black mb-1">{value}</span>
            <span className="text-[10px] font-medium opacity-80 uppercase tracking-tight">{label}</span>
        </div>
    )
}
