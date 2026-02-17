import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router'
import { useContact } from '../../../hooks/useContacts'
import { useMeetings, useActions } from '../../../hooks/useMeetings'
import {
  ArrowLeft,
  Calendar,
  Mail,
  Building,
  Loader2,
  CheckCircle,
} from 'lucide-react'

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
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    client.dealStage === 'Closed Won'
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
                    <div
                      key={meeting._id}
                      className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="shrink-0">
                        <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-cyan-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900">
                          {meeting.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(meeting.date).toLocaleDateString()} •{' '}
                          {meeting.duration} minutes
                        </p>
                        {meeting.notes && (
                          <p className="text-sm text-gray-700 mt-2">
                            {meeting.notes}
                          </p>
                        )}
                        {meeting.outcome && (
                          <p className="text-sm text-gray-600 mt-1 italic">
                            Outcome: {meeting.outcome}
                          </p>
                        )}
                      </div>
                    </div>
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
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Actions</h2>
              <p className="text-gray-600 mt-1">
                Tasks and follow-ups for this client
              </p>
            </div>

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
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            action.status === 'completed'
                              ? 'bg-green-100'
                              : action.status === 'overdue'
                                ? 'bg-red-100'
                                : 'bg-cyan-100'
                          }`}
                        >
                          <CheckCircle
                            className={`h-6 w-6 ${
                              action.status === 'completed'
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
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              action.priority === 'high'
                                ? 'bg-red-100 text-red-800'
                                : action.priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {action.priority}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              action.status === 'completed'
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
                          {action.description}
                        </p>
                        {action.dueDate && (
                          <p className="text-sm text-gray-500 mt-1">
                            Due: {new Date(action.dueDate).toLocaleDateString()}
                          </p>
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
    </div>
  )
}
