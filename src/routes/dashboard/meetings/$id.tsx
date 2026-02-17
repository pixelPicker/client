import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Users, Calendar, Loader2 } from 'lucide-react'
import { useMeeting } from '../../../hooks/useMeetings'
import { useActions } from '../../../hooks/useMeetings'
import { useState, useEffect } from 'react'
import { api } from '../../../lib/api'

export const Route = createFileRoute('/dashboard/meetings/$id')({
  component: MeetingDetails,
})

function MeetingDetails() {
  const { id } = useParams({ from: '/dashboard/meetings/$id' })
  const navigate = useNavigate()
  const { data: meeting, isLoading, error } = useMeeting(id)
  const { data: actions } = useActions(meeting?.clientId, meeting?.dealId)
  const [toasts, setToasts] = useState<
    Array<{
      id: string
      message: string
      approve: () => void
      reject: () => void
    }>
  >([])

  useEffect(() => {
    if (actions && meeting) {
      const pendingAIActions = actions.filter(
        (a) =>
          a.source === 'ai' &&
          a.status === 'pending' &&
          a.meetingId === meeting._id,
      )
      const newToasts = pendingAIActions.map((action) => {
        const message =
          action.type === 'schedule'
            ? `AI detected scheduling intent: Schedule follow-up on ${new Date(action.suggestedData.dateTime).toLocaleString()}?`
            : `AI suggests moving deal to ${action.suggestedData.proposedStage}?`

        const approve = async () => {
          await api('/action/confirm', {
            method: 'POST',
            body: JSON.stringify({ actionId: action._id }),
          })
          setToasts((prev) => prev.filter((t) => t.id !== action._id))
        }

        const reject = async () => {
          await api(`/action/${action._id}`, { method: 'DELETE' })
          setToasts((prev) => prev.filter((t) => t.id !== action._id))
        }

        return { id: action._id, message, approve, reject }
      })
      setToasts(newToasts)
    }
  }, [actions, meeting])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate({ to: -1 })}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{meeting.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(meeting.dateTime).toLocaleDateString()} at{' '}
                {new Date(meeting.dateTime).toLocaleTimeString()}
              </span>
            </div>
            {meeting.participants && meeting.participants.length > 0 && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{meeting.participants.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Transcript */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Transcript
          </h3>
          <div className="prose max-w-none">
            {meeting.transcript ? (
              <p className="text-gray-700 whitespace-pre-line">
                {meeting.transcript}
              </p>
            ) : (
              <p className="text-gray-500 italic">No transcript available</p>
            )}
          </div>
        </div>

        {/* Right: AI Insights */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            AI Insights
          </h3>
          <div className="space-y-4">
            {insights.summary && (
              <div>
                <h4 className="font-medium text-gray-900">Summary</h4>
                <p className="text-gray-700 mt-1">{insights.summary}</p>
              </div>
            )}

            {insights.participants && insights.participants.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900">Participants</h4>
                <ul className="text-gray-700 mt-1 list-disc list-inside">
                  {insights.participants.map((p: string, i: number) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            )}

            {insights.keyTopics && insights.keyTopics.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900">Key Topics</h4>
                <ul className="text-gray-700 mt-1 list-disc list-inside">
                  {insights.keyTopics.map((topic: string, i: number) => (
                    <li key={i}>{topic}</li>
                  ))}
                </ul>
              </div>
            )}

            {insights.nextStep && (
              <div>
                <h4 className="font-medium text-gray-900">Next Step</h4>
                <p className="text-gray-700 mt-1">{insights.nextStep}</p>
              </div>
            )}

            {insights.objection && (
              <div>
                <h4 className="font-medium text-gray-900">Objection</h4>
                <p className="text-gray-700 mt-1">{insights.objection}</p>
              </div>
            )}

            {insights.intent && (
              <div>
                <h4 className="font-medium text-gray-900">Buyer Intent</h4>
                <p className="text-gray-700 mt-1">{insights.intent}</p>
              </div>
            )}

            {insights.timeline && (
              <div>
                <h4 className="font-medium text-gray-900">Timeline</h4>
                <p className="text-gray-700 mt-1">{insights.timeline}</p>
              </div>
            )}

            {insights.riskSignals && insights.riskSignals.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900">Risk Signals</h4>
                <ul className="text-gray-700 mt-1 list-disc list-inside">
                  {insights.riskSignals.map((risk: string, i: number) => (
                    <li key={i}>{risk}</li>
                  ))}
                </ul>
              </div>
            )}

            {insights.schedulingIntent && (
              <div>
                <h4 className="font-medium text-gray-900">Scheduling Intent</h4>
                <p className="text-gray-700 mt-1">
                  {insights.schedulingIntent}
                </p>
              </div>
            )}

            {insights.dealSignal && (
              <div>
                <h4 className="font-medium text-gray-900">Deal Signal</h4>
                <p className="text-gray-700 mt-1">{insights.dealSignal}</p>
              </div>
            )}

            {!Object.keys(insights).length && (
              <p className="text-gray-500 italic">No AI insights available</p>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 space-y-2 z-50">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="bg-blue-500 text-white p-4 rounded-lg shadow-lg max-w-sm"
            >
              <p>{toast.message}</p>
              <div className="mt-2 space-x-2">
                <button
                  onClick={toast.approve}
                  className="bg-green-600 px-3 py-1 rounded text-sm"
                >
                  Approve
                </button>
                <button
                  onClick={toast.reject}
                  className="bg-red-600 px-3 py-1 rounded text-sm"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
