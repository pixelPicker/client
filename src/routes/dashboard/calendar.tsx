import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useCalendar } from '../../hooks/useMeetings'
import { Calendar as CalendarIcon, Loader2, Plus, Search } from 'lucide-react'
import { AddMeetingModal } from '../../components/AddMeetingModal'
import { Pagination } from '../../components/ui/pagination'
import { useEffect } from 'react'

export const Route = createFileRoute('/dashboard/calendar')({
  component: CalendarPage,
})

function CalendarPage() {
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const { data: meetingsResponse, isLoading, error } = useCalendar(debouncedSearch, page, 10, 'upcoming')
  const meetings = meetingsResponse?.data || []
  const totalPages = meetingsResponse?.totalPages || 1

  const upcomingMeetings = meetings

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">View and manage your meetings</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Meeting
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Side: Calendar - 1/4 width */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Calendar View
            </h2>
            <select
              value={view}
              onChange={(e) =>
                setView(e.target.value as 'month' | 'week' | 'day')
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="month">Month</option>
              <option value="week">Week</option>
              <option value="day">Day</option>
            </select>
          </div>

          {/* Simple Month Calendar Placeholder */}
          <div className="text-center text-gray-500">
            <CalendarIcon className="h-24 w-24 mx-auto mb-4 text-gray-300" />
            <p>{view.charAt(0).toUpperCase() + view.slice(1)} view calendar</p>
            <p className="text-sm">Calendar component would go here</p>
          </div>
        </div>

        {/* Right Side: Meetings - 3/4 width */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Upcoming Meetings
              </h2>
              <p className="text-gray-600 mt-1">All scheduled meetings</p>
            </div>
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search meetings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
              />
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-cyan-600 mb-2" />
                <p className="text-gray-500 text-sm">Loading meetings...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-600">
                <p>Error loading meetings: {(error as any).message}</p>
              </div>
            ) : upcomingMeetings.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm ? 'No meetings match your search' : 'No upcoming meetings'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingMeetings.map((meeting: any) => (
                  <Link
                    to="/dashboard/meetings/$id"
                    params={{ id: meeting._id }}
                    key={meeting._id}
                    className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors block"
                  >
                    <div className="shrink-0">
                      <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                        <CalendarIcon className="h-6 w-6 text-cyan-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900">
                        {meeting.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {meeting.dateTime
                          ? new Date(meeting.dateTime).toLocaleString()
                          : 'No date'}
                      </p>
                      {meeting.clientId && (
                        <p className="text-sm text-gray-700 mt-2">
                          {meeting.clientId.name} - {meeting.clientId.company}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}

                {totalPages > 1 && (
                  <div className="pt-4 border-t border-gray-100">
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                      isLoading={isLoading}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <AddMeetingModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  )
}
