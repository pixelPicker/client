import { useMomentum, useStreaks } from '../hooks/useMomentum'
import {
    Dialog,
    DialogContent,
} from './ui/dialog'
import { Progress } from './ui/progress'
import { Trophy, Star, Flame, Calendar, Award, Zap } from 'lucide-react'

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
            <DialogContent className="max-w-2xl bg-white p-0 overflow-hidden gap-0">
                {/* Header with Level & XP */}
                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Trophy className="h-64 w-64" />
                    </div>

                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <p className="text-cyan-100 text-sm font-medium uppercase tracking-wider mb-1">Career Level</p>
                            <h2 className="text-5xl font-bold mb-2">Level {career.level}</h2>
                            <div className="flex items-center gap-2 text-cyan-100 text-sm">
                                <Star className="h-4 w-4 fill-cyan-100" />
                                <span>{Math.round(career.xp)} Total XP</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30 text-center min-w-[100px]">
                                <p className="text-3xl font-bold">{momentum.emoji}</p>
                                <p className="text-xs font-medium uppercase mt-1">{momentum.level}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 relative z-10">
                        <div className="flex justify-between text-xs font-medium text-cyan-100 mb-2">
                            <span>{Math.round(career.currentLevelProgress)} XP</span>
                            <span>{Math.round(career.nextLevelXp)} XP to Level {career.level + 1}</span>
                        </div>
                        <Progress value={progressPercentage} className="h-3 bg-black/20" indicatorClassName="bg-yellow-400" />
                    </div>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {/* Activity Streaks Summary */}
                    {streaks && (
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex flex-col items-center text-center">
                                <Flame className="h-6 w-6 text-orange-500 mb-2" />
                                <span className="text-2xl font-bold text-gray-900">{streaks.followupStreak}</span>
                                <span className="text-xs text-gray-500">Day Streak</span>
                            </div>
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col items-center text-center">
                                <Calendar className="h-6 w-6 text-blue-500 mb-2" />
                                <span className="text-2xl font-bold text-gray-900">{streaks.preparedCallStreak}</span>
                                <span className="text-xs text-gray-500">Prepared Calls</span>
                            </div>
                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex flex-col items-center text-center">
                                <Zap className="h-6 w-6 text-emerald-500 mb-2" />
                                <span className="text-2xl font-bold text-gray-900">{streaks.activeDealStreak}</span>
                                <span className="text-xs text-gray-500">Active Days</span>
                            </div>
                        </div>
                    )}

                    {/* Achievements Grid */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Award className="h-5 w-5 text-purple-600" />
                            Achievements
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {achievements.map((ach) => (
                                <div
                                    key={ach.id}
                                    className={`flex items-start gap-4 p-4 rounded-xl border ${ach.locked
                                        ? 'bg-gray-50 border-gray-100 opacity-60 grayscale'
                                        : 'bg-white border-purple-100 shadow-sm'}`}
                                >
                                    <div className={`text-3xl ${ach.locked ? 'opacity-50' : ''}`}>
                                        {ach.icon}
                                    </div>
                                    <div>
                                        <h4 className={`font-bold ${ach.locked ? 'text-gray-500' : 'text-gray-900'}`}>
                                            {ach.name}
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                            {ach.description}
                                        </p>
                                        {!ach.locked && ach.unlockedAt && (
                                            <p className="text-[10px] text-purple-600 font-medium mt-2">
                                                Unlocked {new Date(ach.unlockedAt).toLocaleDateString()}
                                            </p>
                                        )}
                                        {ach.locked && (
                                            <p className="text-[10px] text-gray-400 font-medium mt-2">
                                                Locked
                                            </p>
                                        )}
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
