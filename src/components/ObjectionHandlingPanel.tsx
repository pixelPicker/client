import { useState, useMemo } from 'react'
import {
    ShieldAlert,
    ChevronDown,
    ChevronUp,
    DollarSign,
    Clock,
    Users,
    Target,
    HelpCircle,
    MessageCircle
} from 'lucide-react'

interface Objection {
    type: string
    detail: string
    evidence: string
    severity: number
    meetingTitle: string
    meetingDate: string
    clientName: string
}

interface ObjectionHandlingPanelProps {
    meetings: any[] // Using any for simplicity as Meeting type is complex
}

export function ObjectionHandlingPanel({ meetings }: ObjectionHandlingPanelProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null)

    // Extract all objections from meetings that have AI insights
    const objections = useMemo(() => {
        const allObjections: Objection[] = []

        meetings.forEach(meeting => {
            // Check if meeting has insights and objections
            if (meeting.aiInsights && meeting.aiInsights.objections && Array.isArray(meeting.aiInsights.objections)) {
                meeting.aiInsights.objections.forEach((obj: any) => {
                    allObjections.push({
                        type: obj.type || 'Other',
                        detail: obj.detail,
                        evidence: obj.evidence,
                        severity: obj.severity || 0.5,
                        meetingTitle: meeting.title,
                        meetingDate: meeting.dateTime,
                        clientName: meeting.clientId?.name || 'Unknown Client'
                    })
                })
            }
        })

        // Sort by severity (desc) and date (desc)
        return allObjections.sort((a, b) => {
            if (b.severity !== a.severity) return b.severity - a.severity
            return new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime()
        }).slice(0, 5) // Top 5
    }, [meetings])

    const getIconForType = (type: string) => {
        const t = type.toLowerCase()
        if (t.includes('price') || t.includes('budget') || t.includes('cost')) return <DollarSign className="h-5 w-5 text-emerald-600" />
        if (t.includes('time') || t.includes('schedule') || t.includes('delay')) return <Clock className="h-5 w-5 text-amber-600" />
        if (t.includes('competit')) return <Target className="h-5 w-5 text-red-600" />
        if (t.includes('adoption') || t.includes('Implement')) return <Users className="h-5 w-5 text-blue-600" />
        return <ShieldAlert className="h-5 w-5 text-gray-600" />
    }

    const getAdviceForType = (type: string) => {
        const t = type.toLowerCase()
        if (t.includes('price') || t.includes('budget'))
            return "Focus on ROI and Value. Break down the cost over time (TCO). Highlight potential savings or revenue gains compared to the investment."
        if (t.includes('time') || t.includes('schedule'))
            return "Isolate the timeline constraint. Ask 'If we could solve X by date Y, would you move forward?'. Offer a phased implementation plan."
        if (t.includes('competit'))
            return "Acknowledge the competitor but pivot to our unique differentiators. Focus on specific pain points where we outperform them."
        if (t.includes('adoption') || t.includes('implement'))
            return "Emphasize our onboarding support and success stories. Show a clear, low-risk implementation roadmap."

        return "Listen actively, validate their concern ('I understand why you'd say that'), and fetch more information before proposing a solution."
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <MessageCircle className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Objection Handling & FAQ</h2>
                        <p className="text-sm text-gray-500">Live insights from your meeting context</p>
                    </div>
                </div>
            </div>

            <div className="divide-y divide-gray-100">
                {objections.length === 0 ? (
                    <div className="p-8 text-center">
                        <HelpCircle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No objections detected in recent meetings yet.</p>
                        <p className="text-xs text-gray-400 mt-1">AI will automatically populate this when it hears objections.</p>
                    </div>
                ) : (
                    objections.map((obj, index) => {
                        const id = `obj-${index}`
                        const isExpanded = expandedId === id

                        return (
                            <div key={id} className="transition-all duration-200">
                                <button
                                    onClick={() => setExpandedId(isExpanded ? null : id)}
                                    className="w-full flex items-start gap-4 p-4 text-left hover:bg-gray-50 transition-colors"
                                >
                                    <div className="shrink-0 mt-0.5">
                                        {getIconForType(obj.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-4">
                                            <h3 className="text-sm font-medium text-gray-900 truncate pr-4">
                                                {obj.detail}
                                            </h3>
                                            {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full capitalize">
                                                {obj.type}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                • {obj.clientName}
                                            </span>
                                        </div>
                                    </div>
                                </button>

                                {isExpanded && (
                                    <div className="px-4 pb-4 ml-[3.25rem]">
                                        <div className="bg-gray-50 p-4 rounded-lg space-y-3 text-sm">
                                            <div>
                                                <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-1">
                                                    Client Said (Evidence)
                                                </p>
                                                <p className="text-gray-600 italic border-l-2 border-gray-300 pl-3">
                                                    "{obj.evidence}"
                                                </p>
                                            </div>

                                            <div className="bg-white border border-purple-100 rounded p-3">
                                                <p className="font-semibold text-purple-700 text-xs uppercase tracking-wide mb-1 flex items-center gap-1">
                                                    💡 Suggested Response
                                                </p>
                                                <p className="text-gray-800">
                                                    {getAdviceForType(obj.type)}
                                                </p>
                                            </div>

                                            <div className="text-xs text-gray-400 pt-1 text-right">
                                                Source: {obj.meetingTitle} ({new Date(obj.meetingDate).toLocaleDateString()})
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
