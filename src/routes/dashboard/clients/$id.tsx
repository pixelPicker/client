import { createFileRoute, useParams, useNavigate, Link } from '@tanstack/react-router'
import { useContact } from '../../../hooks/useContacts'
import { useMeetings, useActions } from '../../../hooks/useMeetings'
import {
  ArrowLeft,
  Calendar,
  Mail,
  Building,
  Loader2,
  CheckCircle,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { AddMeetingModal } from '../../../components/AddMeetingModal'
import { EmailComposerModal } from '../../../components/EmailComposerModal'
import { Button } from '@/components/ui/button'
import { api } from '../../../lib/api'

export const Route = createFileRoute('/dashboard/clients/$id')({
  component: ClientDetails,
})

function ClientDetails() {
  const { id } = useParams({ from: '/dashboard/clients/$id' })
  const navigate = useNavigate()
  const {
    data: client,
    isLoading: clientLoading,
    error: clientError,
  } = useContact(id)
  const { data: meetings, isLoading: meetingsLoading } = useMeetings(id)
  const { data: actions, isLoading: actionsLoading } = useActions(id)

  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false)
  const [meetingModalData, setMeetingModalData] = useState<any>(null)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [emailModalData, setEmailModalData] = useState<any>(null)
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null)

  const handleAction = async (actionId: string, type: 'approve' | 'reject') => {
    try {
      if (type === 'approve') {
        const action = actions?.find((a) => a._id === actionId)
        if (action?.type === 'schedule') {
          setMeetingModalData({
            title: action.suggestedData.title,
            dateTime: action.suggestedData.dateTime,
            clientId: client?._id,
            notes: action.suggestedData.notes || '',
          })
          setSelectedActionId(actionId)
          setIsMeetingModalOpen(true)
          return
        }

        if (action?.type === 'email') {
          setEmailModalData({
            to: client?.email || '',
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
      window.location.reload()
    } catch (err) {
      console.error('Failed to process action', err)
    }
  }

  if (clientLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600 mb-2" />
        <p className="text-gray-500 text-sm">Loading client details...</p>
      </div>
    )
  }

  if (clientError || !client) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>Client not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Stats and Meetings */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate({ to: '/dashboard/clients' })}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {client.name}
                </h1>
                <p className="text-gray-600">{client.company}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                Last contact:{' '}
                {client.lastContactedAt
                  ? new Date(client.lastContactedAt).toLocaleDateString()
                  : 'Never'}
              </p>
            </div>
          </div>{' '}
          {/* Client Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <Mail className="h-5 w-5 text-cyan-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Contact</h3>
              </div>
              <div className="space-y-2">
                <p className="text-gray-600">{client.email}</p>
                {client.phone && (
                  <p className="text-gray-600">{client.phone}</p>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Building className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Deal Status</h3>
              </div>
              <div className="space-y-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${client.dealStage === 'Closed Won'
                    ? 'bg-green-100 text-green-800'
                    : client.dealStage === 'Negotiation'
                      ? 'bg-blue-100 text-blue-800'
                      : client.dealStage === 'Lost'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                >
                  {client.dealStage}
                </span>
                {client.dealValue && (
                  <p className="text-gray-600 font-medium">
                    ${client.dealValue.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
          {/* Meetings Section */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Meetings</h2>
              <p className="text-gray-600 mt-1">
                All meetings with this client
              </p>
            </div>

            <div className="p-6">
              {meetingsLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-cyan-600 mb-2" />
                  <p className="text-gray-500 text-sm">Loading meetings...</p>
                </div>
              ) : !meetings || meetings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No meetings scheduled</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {meetings.map((meeting: any) => (
                    <Link
                      to="/dashboard/meetings/$id"
                      params={{ id: meeting._id }}
                      key={meeting._id}
                      className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                    >
                      <div className="shrink-0">
                        <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center group-hover:bg-cyan-200 transition-colors">
                          <Calendar className="h-6 w-6 text-cyan-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 group-hover:text-cyan-700 transition-colors">
                          {meeting.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(meeting.dateTime).toLocaleDateString()} •{' '}
                          {meeting.duration || 30} minutes
                        </p>
                        {meeting.notes && (
                          <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                            {meeting.notes}
                          </p>
                        )}
                        {meeting.outcome && (
                          <p className="text-sm text-gray-600 mt-1 italic">
                            Outcome: {meeting.outcome}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Notes Section */}
          {client.notes && client.notes.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Notes</h2>
              </div>
              <div className="p-6 space-y-4">
                {client.notes.map((note: any, index: number) => (
                  <div key={index} className="border-l-4 border-cyan-200 pl-4">
                    <p className="text-sm text-gray-700">{note.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Actions */}
        <div>
          {/* Actions Section */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

            <div className="p-6">
              {actionsLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-cyan-600 mb-2" />
                  <p className="text-gray-500 text-sm">Loading actions...</p>
                </div>
              ) : !actions || actions.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No actions scheduled</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {actions.map((action: any) => (
                    <div
                      key={action._id}
                      className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="shrink-0">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${action.status === 'completed'
                            ? 'bg-green-100'
                            : action.status === 'overdue'
                              ? 'bg-red-100'
                              : 'bg-cyan-100'
                            }`}
                        >
                          <CheckCircle
                            className={`h-6 w-6 ${action.status === 'completed'
                              ? 'text-green-600'
                              : action.status === 'overdue'
                                ? 'text-red-600'
                                : 'text-cyan-600'
                              }`}
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-medium text-gray-900">
                            {action.title}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${action.priority === 'high'
                              ? 'bg-red-100 text-red-800'
                              : action.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                              }`}
                          >
                            {action.priority || 'medium'}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${action.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : action.status === 'overdue'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                              }`}
                          >
                            {action.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">
                          {action.description || (action.type === 'schedule' ? `Proposed for ${new Date(action.suggestedData.dateTime).toLocaleDateString()}` : action.suggestedData.task)}
                        </p>
                        {action.dueDate && (
                          <p className="text-sm text-gray-500 mt-1">
                            Due: {new Date(action.dueDate).toLocaleDateString()}
                          </p>
                        )}
                        {action.status === 'pending' && (
                          <div className="flex gap-2 mt-3">
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
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
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
