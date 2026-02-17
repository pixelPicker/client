import { createFileRoute, Outlet, Link } from '@tanstack/react-router'
import {
  Bell,
  User,
  Calendar,
  Users,
  LayoutDashboard,
  Briefcase,
} from 'lucide-react'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})

import { Protected } from '../../components/Protected'
import { useLogout } from '../../hooks/useAuth'

// ... existing imports

function DashboardLayout() {
  const logout = useLogout()

  return (
    <Protected>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white w-screen border-b border-gray-200 fixed top-0 z-10">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-gray-900 tracking-tight">
                  MyApp
                </span>
              </div>
              <nav className="hidden flex-1 justify-center sm:flex ">
                <Link
                  to="/dashboard"
                  activeOptions={{ exact: true }}
                  activeProps={{ className: 'border-cyan-500 text-gray-900' }}
                  inactiveProps={{
                    className:
                      'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                  }}
                  className="inline-flex items-center px-8 pt-1 border-b-2 text-base font-medium"
                >
                  <LayoutDashboard className="w-5 h-5 mr-2" />
                  Dashboard
                </Link>
                <Link
                  to="/dashboard/calendar"
                  activeOptions={{ exact: true }}
                  activeProps={{ className: 'border-cyan-500 text-gray-900' }}
                  inactiveProps={{
                    className:
                      'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                  }}
                  className="inline-flex items-center px-8 pt-1 border-b-2 text-base font-medium"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Calendar
                </Link>
                <Link
                  to="/dashboard/clients"
                  activeProps={{ className: 'border-cyan-500 text-gray-900' }}
                  activeOptions={{ exact: true }}
                  inactiveProps={{
                    className:
                      'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                  }}
                  className="inline-flex items-center px-8 pt-1 border-b-2 text-base font-medium"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Clients
                </Link>
                <Link
                  to="/dashboard/deals"
                  activeProps={{ className: 'border-cyan-500 text-gray-900' }}
                  activeOptions={{ exact: true }}
                  inactiveProps={{
                    className:
                      'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                  }}
                  className="inline-flex items-center px-8 pt-1 border-b-2 text-base font-medium"
                >
                  <Briefcase className="w-5 h-5 mr-2" />
                  Deals
                </Link>
              </nav>
              <div className="flex items-center space-x-4">
                <button className="p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500">
                  <span className="sr-only">View notifications</span>
                  <Bell className="h-6 w-6" />
                </button>
                <div className="relative ml-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={logout}
                      className="h-10 w-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-semibold text-lg hover:bg-cyan-200 transition-colors cursor-pointer"
                      title="Sign out"
                    >
                      <User className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="h-dvh pt-15">
          <div className="px-4 sm:px-6 lg:px-8 py-8 h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </Protected>
  )
}
