import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/')({
  component: RouteComponent,
})

import { Users, Briefcase, Calendar as CalendarIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react'

function RouteComponent() {
  // Fake data
  const stats = {
    clients: {
      total: 124,
      growth: '+12%',
      trend: 'up',
    },
    deals: {
      closed: 45,
      unclosed: 12,
      total: 57,
    },
    meetings: {
      upcoming: 8,
      next: 'Today, 2:00 PM',
    },
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start h-full">
      {/* Insights Section - Col Span 2 */}
      <div className="lg:col-span-2 space-y-8 h-full">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Overview</h2>
          <p className="text-gray-500">Here's what's happening with your business today.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Clients Stat */}
          <div className="bg-white p-6 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Clients</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.clients.total}</p>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-emerald-600 flex items-center font-medium">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                {stats.clients.growth}
              </span>
              <span className="text-gray-500 ml-2">from last month</span>
            </div>
          </div>

          {/* Deals Stat */}
          <div className="bg-white p-6 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Deals</p>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900">{stats.deals.total}</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex w-full h-2 rounded-full overflow-hidden bg-gray-100">
                <div
                  className="bg-blue-500 h-full"
                  style={{ width: `${(stats.deals.closed / stats.deals.total) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-lg bg-blue-500"></div>
                  <span>{stats.deals.closed} Closed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-lg bg-gray-200"></div>
                  <span>{stats.deals.unclosed} Remaining</span>
                </div>
              </div>
            </div>
          </div>

          {/* Meetings Stat - now explicitly Meetings */}
          <div className="bg-white p-6 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-500">Upcoming Meetings</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.meetings.upcoming}</p>
            </div>
            <div className="mt-4 text-sm">
              <span className="text-gray-500">Next meeting:</span>
              <p className="font-medium text-gray-900 mt-1">{stats.meetings.next}</p>
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
        <div className="bg-white p-6 rounded-xl h-full min-h-[400px]">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Calendar</h3>
          <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-gray-400">
            Calendar Component Placeholder
          </div>
          <div className="mt-6 space-y-4">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Upcoming</h4>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-12 text-center">
                  <span className="block text-xs font-bold text-gray-500">FEB</span>
                  <span className="block text-lg font-bold text-gray-900">{17 + i}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Strategy Meeting</p>
                  <p className="text-xs text-gray-500">10:00 AM - 11:30 AM</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
