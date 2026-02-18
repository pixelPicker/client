import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/')({
  component: RouteComponent,
})

import {
  ArrowUpRight,
  Loader2,
} from 'lucide-react'
import { CalendarWidget } from '../../components/CalendarWidget'
import { useContacts } from '../../hooks/useContacts'
import { useDeals } from '../../hooks/useDeals'
import { useCalendar } from '../../hooks/useMeetings'

function RouteComponent() {
  const { data: clientsData, isLoading: clientsLoading } = useContacts('', 1, 1000)
  const { data: dealsData, isLoading: dealsLoading } = useDeals('', 1, 1000)
  const { data: meetingsData, isLoading: meetingsLoading } = useCalendar('', 1, 1000)

  if (clientsLoading || dealsLoading || meetingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    )
  }

  const deals = dealsData?.data || []
  const meetings = meetingsData?.data || []

  const totalClients = clientsData?.total || 0
  const totalDeals = dealsData?.total || 0
  const activeDeals = deals?.filter((d) => d.status === 'active').length || 0
  const closedDeals = deals?.filter((d) => d.status === 'closed').length || 0
  const upcomingMeetings =
    meetings?.filter((m) => new Date(m.dateTime) > new Date()).length || 0
  const nextMeeting = meetings
    ?.filter((m) => new Date(m.dateTime) > new Date())
    .sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
    )[0]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start h-full">
      {/* Insights Section - Col Span 2 */}
      <div className="lg:col-span-2 space-y-8 h-full">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Overview
          </h2>
          <p className="text-gray-500">
            Here's what's happening with your business today.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Clients Stat */}
          <div className="bg-white p-6 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Clients</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {totalClients}
              </p>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-emerald-600 flex items-center font-medium">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                Active
              </span>
              <span className="text-gray-500 ml-2">managed</span>
            </div>
          </div>

          {/* Deals Stat */}
          <div className="bg-white p-6 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Deals</p>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900">
                  {activeDeals}
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex w-full h-2 rounded-full overflow-hidden bg-gray-100">
                <div
                  className="bg-blue-500 h-full"
                  style={{
                    width:
                      totalDeals > 0
                        ? `${(closedDeals / totalDeals) * 100}%`
                        : '0%',
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-lg bg-blue-500"></div>
                  <span>{closedDeals} Closed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-lg bg-gray-200"></div>
                  <span>{totalDeals - closedDeals} Remaining</span>
                </div>
              </div>
            </div>
          </div>

          {/* Meetings Stat */}
          <div className="bg-white p-6 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Upcoming Meetings
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {upcomingMeetings}
              </p>
            </div>
            <div className="mt-4 text-sm">
              <span className="text-gray-500">Next meeting:</span>
              <p className="font-medium text-gray-900 mt-1">
                {nextMeeting
                  ? `${nextMeeting.title} on ${new Date(nextMeeting.dateTime).toLocaleDateString()}`
                  : 'No upcoming meetings'}
              </p>
            </div>
          </div>
        </div>

        {/* Placeholder for future insights/charts */}
        <div className="bg-white p-6 rounded-xl min-h-[300px] flex items-center justify-center text-gray-400">
          More insights coming soon...
        </div>
      </div>


      {/* Calendar Section - Col Span 1 */}
      <div className="lg:col-span-1 h-full">
        {/* Removed fixed height constraint to let it grow */}
        <div className="h-full min-h-[400px]">
          <CalendarWidget meetings={meetings} />
          <div className="mt-6 space-y-4">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Upcoming
            </h4>
            {meetings
              ?.filter((m) => new Date(m.dateTime) > new Date())
              .slice(0, 3)
              .map((meeting) => (
                <Link
                  to="/dashboard/meetings/$id"
                  params={{ id: meeting._id }}
                  key={meeting._id}
                  className="flex gap-4 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="shrink-0 w-12 text-center">
                    <span className="block text-xs font-bold text-gray-500">
                      {new Date(meeting.dateTime)
                        .toLocaleDateString('en-US', { month: 'short' })
                        .toUpperCase()}
                    </span>
                    <span className="block text-lg font-bold text-gray-900">
                      {new Date(meeting.dateTime).getDate()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {meeting.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(meeting.dateTime).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </Link>
              )) ||
              [1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="shrink-0 w-12 text-center">
                    <span className="block text-xs font-bold text-gray-500">
                      FEB
                    </span>
                    <span className="block text-lg font-bold text-gray-900">
                      {17 + i}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      No meetings
                    </p>
                    <p className="text-xs text-gray-500">-</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
