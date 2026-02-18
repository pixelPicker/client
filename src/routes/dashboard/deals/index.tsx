import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Plus, Search, Loader2 } from 'lucide-react'
import { useDeals } from '../../../hooks/useDeals'
import { useState } from 'react'

export const Route = createFileRoute('/dashboard/deals/')({
  component: Deals,
})

import { AddDealModal } from '../../../components/AddDealModal'
import { Pagination } from '../../../components/ui/pagination'
import { useEffect } from 'react'

function Deals() {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedStage, setSelectedStage] = useState<string>('all')
  const [isAddDealOpen, setIsAddDealOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPage(1) // Reset to first page on search
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const { data: dealsResponse, isLoading, error } = useDeals(debouncedSearch, page, selectedStage)
  const deals = dealsResponse?.data || []
  const totalPages = dealsResponse?.totalPages || 1

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
          <p className="text-gray-600">Manage your deals and track progress</p>
        </div>
        <button
          onClick={() => setIsAddDealOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Deal
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search deals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
              />
            </div>
            <select
              value={selectedStage}
              onChange={(e) => {
                setSelectedStage(e.target.value)
                setPage(1)
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm bg-white"
            >
              <option value="all">All Stages</option>
              <option value="Lead">Lead</option>
              <option value="Discovery">Discovery</option>
              <option value="Qualified">Qualified</option>
              <option value="Proposal Sent">Proposal Sent</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Closed Won">Closed Won</option>
              <option value="Closed Lost">Closed Lost</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-600 mb-2" />
              <p className="text-gray-500 text-sm">Loading deals...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">
              <p>Error loading deals: {(error as any).message}</p>
            </div>
          ) : deals.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium">No deals found</p>
              <p className="text-gray-500 text-sm mt-1">
                {searchTerm ? 'Try a different search term' : 'Get started by adding your first deal'}
              </p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-gray-50 text-left border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Deal
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Stage
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Last Activity
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {deals.map((deal) => (
                    <tr
                      key={deal._id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate({ to: '/dashboard/deals/$id', params: { id: deal._id } })}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 shrink-0 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold">
                            {deal.title.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {deal.title}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {deal.clientId?.name} - {deal.clientId?.company}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${deal.stage === 'Closed Won'
                            ? 'bg-green-100 text-green-800'
                            : deal.stage === 'Negotiation'
                              ? 'bg-blue-100 text-blue-800'
                              : deal.stage === 'Closed Lost'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          {deal.stage}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          ${deal.value?.toLocaleString() || '0'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${deal.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : deal.status === 'closed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          {deal.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {deal.lastActivity
                          ? new Date(deal.lastActivity).toLocaleDateString()
                          : 'No activity'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  isLoading={isLoading}
                />
              )}
            </>
          )}
        </div>
      </div>

      <AddDealModal open={isAddDealOpen} onOpenChange={setIsAddDealOpen} />
    </div>
  )
}
