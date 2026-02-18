import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'

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
import { ObjectionHandlingPanel } from '../../components/ObjectionHandlingPanel'

function RouteComponent() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const { data: clientsData, isLoading: clientsLoading } = useContacts('', 1, 1000)
  const { data: dealsData, isLoading: dealsLoading } = useDeals('', 1, 'all', 1000)
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

  // Calculate stats based on stages
  const activeDealsList = deals?.filter((d) => !['Closed Won', 'Closed Lost'].includes(d.stage)) || []
  const closedDealsList = deals?.filter((d) => ['Closed Won', 'Closed Lost'].includes(d.stage)) || []

  const activeDeals = activeDealsList.length
  const closedDealsCount = closedDealsList.length

  const pipelineValue = activeDealsList.reduce((sum, d) => sum + (d.value || 0), 0)
  const wonValue = deals?.filter(d => d.stage === 'Closed Won').reduce((sum, d) => sum + (d.value || 0), 0)

  const upcomingMeetings =
    meetings?.filter((m) => new Date(m.dateTime) > now).length || 0

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
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
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
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Pipeline</p>
              <div className="mt-2 flex  items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900">
                  {activeDeals}
                </p>
                <p className="text-sm font-medium text-gray-500">
                  (${pipelineValue.toLocaleString()})
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex w-full h-10 rounded-md overflow-hidden bg-gray-100">
                <div
                  className="bg-cyan-500 h-full transition-all duration-500"
                  style={{
                    width:
                      totalDeals > 0
                        ? `${(closedDealsCount / totalDeals) * 100}%`
                        : '0%',
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-lg bg-cyan-500"></div>
                  <span>{closedDealsCount} Closed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-lg bg-gray-200"></div>
                  <span>{activeDeals} Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Meetings Stat */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Won
              </p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">
                ${wonValue.toLocaleString()}
              </p>
            </div>
            <div className="mt-4 text-sm">
              <span className="text-gray-500">Upcoming:</span>
              <p className="font-medium text-gray-900 mt-1">
                {upcomingMeetings} scheduled meetings
              </p>
            </div>
          </div>
        </div>



        {/* Objection Handling / Insights */}
        <ObjectionHandlingPanel meetings={meetings} />
      </div>


      {/* Calendar Section - Col Span 1 */}
      <div className="lg:col-span-1 h-full">
        {/* Removed fixed height constraint to let it grow */}
        <div className="h-full min-h-[400px]">
          <CalendarWidget meetings={meetings} />

        </div>
      </div>
    </div>
  )
}
