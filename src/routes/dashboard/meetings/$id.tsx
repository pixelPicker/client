import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Users, Calendar, Loader2, CheckCircle, AlertTriangle, Clock, ArrowRight, X } from 'lucide-react'
import { useMeeting } from '../../../hooks/useMeetings'
import { useActions } from '../../../hooks/useMeetings'
import { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import { Button } from '../../../components/ui/button'

export const Route = createFileRoute('/dashboard/meetings/$id')({
  component: MeetingDetails,
})

import { AIChatWidget } from '../../../components/AIChatWidget'
import { Sparkles } from 'lucide-react'

// ... existing code ...

function MeetingDetails() {
  const { id } = useParams({ from: '/dashboard/meetings/$id' })
  const navigate = useNavigate()
  const { data: meeting, isLoading, error } = useMeeting(id)
  // meeting.clientId is populated, so we need to access ._id
  const { data: actions } = useActions(meeting?.clientId?._id || meeting?.clientId, meeting?.dealId?._id || meeting?.dealId)
  const [pendingActions, setPendingActions] = useState<any[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)

  useEffect(() => {
    if (actions && meeting) {
      const aiActions = actions.filter(
        (a) =>
          a.source === 'ai' &&
          a.status === 'pending' &&
          a.meetingId === meeting._id,
      )
      setPendingActions(aiActions)
    }
  }, [actions, meeting])

  const handleAction = async (actionId: string, type: 'approve' | 'reject') => {
    try {
      if (type === 'approve') {
        await api('/action/confirm', {
          method: 'POST',
          body: JSON.stringify({ actionId }),
        })
      } else {
        await api(`/action/${actionId}`, { method: 'DELETE' })
      }
      setPendingActions((prev) => prev.filter((a) => a._id !== actionId))
    } catch (err) {
      console.error("Failed to process action", err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    )
  }

  if (error || !meeting) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>
          Error loading meeting:{' '}
          {(error as any)?.message || 'Meeting not found'}
        </p>
      </div>
    )
  }

  const insights = meeting.aiInsights || {}

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50">
      {/* Header - Fixed */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate({ to: -1 })}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{meeting.title}</h1>
            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(meeting.dateTime).toLocaleDateString()} • {new Date(meeting.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              {meeting.participants && meeting.participants.length > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{meeting.participants.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs border-purple-200 text-purple-700 hover:bg-purple-50"
            onClick={() => setIsChatOpen(!isChatOpen)}
          >
            <Sparkles className="h-3 w-3 mr-1.5" />
            {isChatOpen ? 'Close Chat' : 'Ask AI'}
          </Button>

          {Object.keys(insights).length > 0 ? (
            <span className="bg-cyan-50 text-cyan-700 text-xs px-2 py-1 rounded-full font-medium border border-cyan-100 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> AI Analyzed
            </span>
          ) : (
            <Button
              size="sm"
              disabled={isAnalyzing}
              className="h-8 text-xs bg-purple-600 hover:bg-purple-700"
              onClick={async () => {
                try {
                  if (!meeting.transcript) {
                    alert("No transcript available to analyze.");
                    return;
                  }
                  setIsAnalyzing(true);
                  await api('/meeting/analyze', {
                    method: 'POST',
                    body: JSON.stringify({ meetingId: meeting._id, transcript: meeting.transcript })
                  });
                  window.location.reload();
                } catch (err) {
                  console.error("Analysis failed", err);
                  alert("Failed to analyze meeting.");
                } finally {
                  setIsAnalyzing(false);
                }
              }}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  ✨ Analyze with AI
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Main Content - Scrollable Split View */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: Transcript */}
        <div className="flex-1 overflow-y-auto p-6 border-r border-gray-200 bg-white">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 sticky top-0 bg-white py-2">Transcript</h2>
          <div className="prose max-w-none text-gray-800 leading-relaxed font-sans text-base">
            {meeting.transcript ? (
              meeting.transcript.split('\n').map((line: string, i: number) => (
                <p key={i} className="mb-4">{line}</p>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <p className="italic">No transcript available for this meeting.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Insights & Actions */}
        <div className="w-[450px] shrink-0 overflow-y-auto bg-gray-50 p-6 space-y-6">

          {/* Action Cards (High Priority) */}
          {pendingActions.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Suggested Actions</h2>
              {pendingActions.map(action => (
                <div key={action._id} className="bg-white border-l-4 border-cyan-500 rounded-r-lg shadow-sm p-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900 text-sm">
                      {action.type === 'schedule' ? '📅 Schedule Follow-up' : '🚀 Update Deal Stage'}
                    </h3>
                    <span className="bg-cyan-100 text-cyan-800 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wide">AI</span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">
                    {action.type === 'schedule'
                      ? `Proposed: ${action.suggestedData.title} on ${new Date(action.suggestedData.dateTime).toLocaleDateString()} at ${new Date(action.suggestedData.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                      : `Move deal to "${action.suggestedData.proposedStage}" phase based on positive signals.`
                    }
                  </p>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="h-7 text-xs bg-cyan-600 hover:bg-cyan-700 w-full"
                      onClick={() => handleAction(action._id, 'approve')}
                    >
                      <CheckCircle className="h-3 w-3 mr-1.5" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs text-gray-500 hover:text-red-600 w-full"
                      onClick={() => handleAction(action._id, 'reject')}
                    >
                      <X className="h-3 w-3 mr-1.5" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AI Summary */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
              Executive Summary
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {insights.summary || "No summary generated yet."}
            </p>
          </div>

          {/* Key Topics */}
          {insights.keyTopics && insights.keyTopics.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Key Topics</h3>
              <div className="flex flex-wrap gap-2">
                {insights.keyTopics.map((topic: string, i: number) => (
                  <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-md">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps & Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-sm font-semibold text-gray-900">Outcome & Next Steps</h3>
            </div>
            <div className="p-4 space-y-4">
              {insights.nextStep && (
                <div className="flex gap-3">
                  <ArrowRight className="h-4 w-4 text-cyan-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">NEXT STEP</p>
                    <p className="text-sm text-gray-700">{insights.nextStep}</p>
                  </div>
                </div>
              )}
              {insights.timeline && (
                <div className="flex gap-3">
                  <Clock className="h-4 w-4 text-cyan-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">TIMELINE</p>
                    <p className="text-sm text-gray-700">{insights.timeline}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Risks & Objections */}
          {(insights.riskSignals?.length > 0 || insights.objection) && (
            <div className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-red-100 bg-red-50/30">
                <h3 className="text-sm font-semibold text-red-700 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Risks & Objections
                </h3>
              </div>
              <div className="p-4 space-y-4">
                {insights.objection && (
                  <div>
                    <p className="text-xs text-red-500 font-medium mb-1">MAIN OBJECTION</p>
                    <p className="text-sm text-gray-700">{insights.objection}</p>
                  </div>
                )}
                {insights.riskSignals && insights.riskSignals.length > 0 && (
                  <div>
                    <p className="text-xs text-red-500 font-medium mb-1">RISK SIGNALS</p>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {insights.riskSignals.map((risk: string, i: number) => (
                        <li key={i}>{risk}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Deal Intel */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">BUYER INTENT</p>
              <p className={`text-sm font-semibold ${insights.intent === 'High' ? 'text-green-600' :
                insights.intent === 'Low' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                {insights.intent || 'Unknown'}
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">DEAL SIGNAL</p>
              <p className={`text-sm font-semibold ${insights.dealSignal === 'Positive' ? 'text-green-600' :
                insights.dealSignal === 'Negative' ? 'text-red-600' : 'text-gray-600'
                }`}>
                {insights.dealSignal || 'Neutral'}
              </p>
            </div>
          </div>

        </div>
      </div>

      <AIChatWidget
        meetingId={meeting._id}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  )
}
