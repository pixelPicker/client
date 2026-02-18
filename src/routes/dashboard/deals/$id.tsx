import { createFileRoute, useParams, useNavigate, Link } from '@tanstack/react-router'
import { useDeal } from '../../../hooks/useDeals'
import { useMeetings, useActions } from '../../../hooks/useMeetings'
import {
  ArrowLeft,
  Calendar,
  Mail,
  Building,
  Loader2,
  CheckCircle,
  Send,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useState } from 'react'
import { AddMeetingModal } from '../../../components/AddMeetingModal'
import { EmailComposerModal } from '../../../components/EmailComposerModal'
import { CoachCard } from '../../../components/CoachCard'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { api } from '../../../lib/api'

export const Route = createFileRoute('/dashboard/deals/$id')({
  component: DealDetails,
})

function DealDetails() {
  const { id } = useParams({ from: '/dashboard/deals/$id' })
  const navigate = useNavigate()
  const { data: deal, isLoading: dealLoading, error: dealError } = useDeal(id)
  const { data: meetings, isLoading: meetingsLoading } = useMeetings(
    undefined,
    id,
  )
  const { data: actions, isLoading: actionsLoading } = useActions(undefined, id)

  const [messages, setMessages] = useState<
    Array<{ role: 'user' | 'assistant'; content: string }>
  >([])
  const [input, setInput] = useState('')
  const [isAsking, setIsAsking] = useState(false)

  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false)
  const [meetingModalData, setMeetingModalData] = useState<any>(null)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [emailModalData, setEmailModalData] = useState<any>(null)
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null)

  const handleAsk = async () => {
    if (!input.trim()) return
    const question = input.trim()
    setMessages((prev) => [...prev, { role: 'user', content: question }])
    setInput('')
    setIsAsking(true)
    try {
      const data = await api(`/deal/${id}/ask`, {
        method: 'POST',
        body: JSON.stringify({ question }),
      })
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.answer },
      ])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error.' },
      ])
    } finally {
      setIsAsking(false)
    }
  }

  const handleAction = async (actionId: string, type: 'approve' | 'reject') => {
    try {
      if (type === 'approve') {
        const action = actions?.find((a) => a._id === actionId)
        if (action?.type === 'schedule') {
          setMeetingModalData({
            title: action.suggestedData.title,
            dateTime: action.suggestedData.dateTime,
            clientId: deal?.clientId?._id || deal?.clientId,
            dealId: deal?._id,
            notes: action.suggestedData.notes || '',
          })
          setSelectedActionId(actionId)
          setIsMeetingModalOpen(true)
          return
        }

        if (action?.type === 'email') {
          setEmailModalData({
            to: (deal?.clientId as any)?.email || '',
            subject: action.suggestedData.subject,
            body: action.suggestedData.body,
            actionId: actionId,
          })
          setSelectedActionId(actionId)
          setIsEmailModalOpen(true)
          return
        }

        await api('/action/confirm', {
          method: 'POST',
          body: JSON.stringify({ actionId }),
        })
      } else {
        await api(`/action/${actionId}`, { method: 'DELETE' })
      }
      // Re-fetch or locally update after confirm/delete
      // For simplicity in this view, we'll let the query invalidate handle it 
      // but locally filtering is faster
      window.location.reload()
    } catch (err) {
      console.error('Failed to process action', err)
    }
  }

  if (dealLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    )
  }

  if (dealError || !deal) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>
          Error loading deal: {(dealError as any)?.message || 'Deal not found'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate({ to: '..' })}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{deal.title}</h1>
            <p className="text-gray-600">
              {deal.clientId.name} - {deal.clientId.company}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            Last activity:{' '}
            {deal.lastActivity
              ? new Date(deal.lastActivity).toLocaleDateString()
              : 'No activity'}
          </p>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Deal Info and Meetings */}
        <div className="space-y-6">
          {/* Deal Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Building className="h-4 w-4 text-cyan-600" />
                <span className="text-sm font-medium text-gray-700">Stage</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {deal.stage}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-cyan-600" />
                <span className="text-sm font-medium text-gray-700">Value</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                ${deal.value.toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-cyan-600" />
                <span className="text-sm font-medium text-gray-700">
                  Status
                </span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {deal.status}
              </p>
            </div>
          </div>

          {/* Meetings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Meetings
            </h2>
            {meetingsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-cyan-600" />
              </div>
            ) : !meetings || meetings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No meetings for this deal
              </p>
            ) : (
              <div className="space-y-4">
                {meetings.map((meeting: any) => (
                  <Link
                    to="/dashboard/meetings/$id"
                    params={{ id: meeting._id }}
                    key={meeting._id}
                    className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer group transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold group-hover:bg-cyan-200 transition-colors">
                      {meeting.title.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 group-hover:text-cyan-700 transition-colors">
                        {meeting.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(meeting.dateTime).toLocaleDateString()} at{' '}
                        {new Date(meeting.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {meeting.notes && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {meeting.notes}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Tabs */}
        <Tabs defaultValue="actions" className="w-full">
          <TabsList>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="coach">🧠 Coach</TabsTrigger>
            <TabsTrigger value="ai">AI Bot</TabsTrigger>
          </TabsList>

          <TabsContent value="actions" className="mt-6">
            {actionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-cyan-600" />
              </div>
            ) : !actions || actions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No actions for this deal
              </p>
            ) : (
              <div className="space-y-4">
                {actions.map((action: any) => (
                  <div
                    key={action._id}
                    className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg"
                  >
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center ${action.status === 'completed'
                        ? 'bg-green-100'
                        : 'bg-gray-100'
                        }`}
                    >
                      {action.status === 'completed' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <div className="h-2 w-2 bg-gray-400 rounded-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {action.description || (action.type === 'schedule' ? `Proposed for ${new Date(action.suggestedData.dateTime).toLocaleDateString()}` : action.suggestedData.task)}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${action.priority === 'high'
                              ? 'bg-red-100 text-red-800'
                              : action.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                              }`}
                          >
                            {action.priority || 'medium'}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${action.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : action.status === 'overdue'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                              }`}
                          >
                            {action.status}
                          </span>
                        </div>
                        {action.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-cyan-600 hover:bg-cyan-700"
                              onClick={() => handleAction(action._id, 'approve')}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs text-gray-400 hover:text-red-600"
                              onClick={() => handleAction(action._id, 'reject')}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="coach" className="mt-6">
            <CoachCard dealId={id} />
          </TabsContent>

          <TabsContent value="ai" className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              AI Assistant
            </h3>
            <div className="h-96 overflow-y-auto space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p className="font-medium">Deal Assistant</p>
                  <p className="text-sm mt-1">
                    Ask questions about deal status, meeting history, or next steps.
                  </p>
                  <p className="text-xs mt-4 text-gray-400">
                    Try: "What were the key takeaways from our last meeting?"
                  </p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs p-3 rounded-lg ${msg.role === 'user'
                        ? 'bg-cyan-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                        }`}
                    >
                      <div className="prose prose-sm max-w-none dark:prose-invert text-inherit">
                        <ReactMarkdown>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isAsking && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-cyan-600" />
                      Thinking...
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
                placeholder="Ask about this deal..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                disabled={isAsking}
              />
              <button
                onClick={handleAsk}
                disabled={!input.trim() || isAsking}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AddMeetingModal
        open={isMeetingModalOpen}
        onOpenChange={setIsMeetingModalOpen}
        initialData={meetingModalData}
        onMeetingCreated={() => {
          if (selectedActionId) {
            api(`/action/${selectedActionId}`, { method: 'DELETE' }).then(() =>
              window.location.reload(),
            )
          }
        }}
      />
      <EmailComposerModal
        open={isEmailModalOpen}
        onOpenChange={setIsEmailModalOpen}
        initialData={emailModalData}
        onEmailSent={() => {
          if (selectedActionId) {
            api(`/action/${selectedActionId}`, { method: 'DELETE' }).then(() =>
              window.location.reload(),
            )
          }
        }}
      />
    </div>
  )
}
