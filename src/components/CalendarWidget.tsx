import { useState, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, Clock, Video, Plus } from 'lucide-react'
import { AddMeetingModal } from './AddMeetingModal'

interface Meeting {
    _id: string
    title: string
    dateTime: string
    participants?: string[]
}

interface CalendarWidgetProps {
    meetings?: Meeting[]
}

export function CalendarWidget({ meetings = [] }: CalendarWidgetProps) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
    const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false)

    // Helper to get days in month
    const daysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    }

    // Helper to get day of week for first day (0-6)
    const firstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    }

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }

    const isSameDay = (d1: Date, d2: Date) => {
        return (
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate()
        )
    }

    const getDaysArray = () => {
        const days = []
        const daysCount = daysInMonth(currentDate)
        const firstDay = firstDayOfMonth(currentDate)

        // Previous month filler
        const prevMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
        const prevMonthDays = daysInMonth(prevMonthDate)
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({
                date: new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), prevMonthDays - i),
                isCurrentMonth: false,
            })
        }

        // Current month
        for (let i = 1; i <= daysCount; i++) {
            days.push({
                date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i),
                isCurrentMonth: true,
            })
        }

        // Next month filler
        const remainingCells = 42 - days.length // 6 rows * 7 cols
        for (let i = 1; i <= remainingCells; i++) {
            days.push({
                date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i),
                isCurrentMonth: false,
            })
        }

        return days
    }

    const calendarDays = useMemo(() => getDaysArray(), [currentDate])

    const selectedMeetings = useMemo(() => {
        if (!selectedDate) return []
        return meetings.filter((m) => isSameDay(new Date(m.dateTime), selectedDate))
    }, [selectedDate, meetings])

    return (
        <div className="bg-white p-6 rounded-xl h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={prevMonth}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5 text-gray-500" />
                    </button>
                    <button
                        onClick={() => setCurrentDate(new Date())}
                        className="text-xs font-medium text-cyan-600 hover:underline px-2"
                    >
                        Today
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <ChevronRight className="h-5 w-5 text-gray-500" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                    <div key={day} className="text-center text-xs font-semibold text-gray-400 py-1">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1 mb-6">
                {calendarDays.map((dayObj, index) => {
                    const hasMeeting = meetings.some((m) => isSameDay(new Date(m.dateTime), dayObj.date))
                    const isSelected = selectedDate && isSameDay(dayObj.date, selectedDate)
                    const isToday = isSameDay(dayObj.date, new Date())

                    return (
                        <button
                            key={index}
                            onClick={() => setSelectedDate(dayObj.date)}
                            className={`
                                h-9 w-9 mx-auto rounded-full flex items-center justify-center text-sm relative transition-all
                                ${dayObj.isCurrentMonth ? 'text-gray-900' : 'text-gray-300'}
                                ${isSelected ? 'bg-cyan-600 text-white shadow-md' : 'hover:bg-gray-100'}
                                ${isToday && !isSelected ? 'border border-cyan-600 text-cyan-700 font-bold' : ''}
                            `}
                        >
                            {dayObj.date.getDate()}
                            {hasMeeting && !isSelected && (
                                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-500"></span>
                            )}
                            {hasMeeting && isSelected && (
                                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white"></span>
                            )}
                        </button>
                    )
                })}
            </div>

            <div className="border-t border-gray-100 pt-4 flex-1 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900 flex items-center">
                        {selectedDate ? (
                            <>
                                {selectedDate.toLocaleDateString('default', { month: 'short', day: 'numeric' })}
                                {isSameDay(selectedDate, new Date()) && <span className="ml-2 text-xs text-gray-400 font-normal">(Today)</span>}
                            </>
                        ) : (
                            "Select a date"
                        )}
                    </h4>
                    <button
                        onClick={() => setIsAddMeetingOpen(true)}
                        className="text-xs flex items-center text-cyan-600 hover:text-cyan-700 font-medium"
                    >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Meeting
                    </button>
                </div>

                {selectedMeetings.length > 0 ? (
                    <div className="space-y-3">
                        {selectedMeetings.map((meeting) => (
                            <Link
                                to="/dashboard/meetings/$id"
                                params={{ id: meeting._id }}
                                key={meeting._id}
                                className="group flex items-start p-2 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 cursor-pointer"
                            >
                                <div className="shrink-0 mt-0.5">
                                    <div className="h-8 w-8 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600">
                                        <Video className="h-4 w-4" />
                                    </div>
                                </div>
                                <div className="ml-3 min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-cyan-700 transition-colors">
                                        {meeting.title}
                                    </p>
                                    <div className="flex items-center mt-0.5 text-xs text-gray-500">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {new Date(meeting.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        No meetings scheduled
                    </div>
                )}
            </div>

            <AddMeetingModal open={isAddMeetingOpen} onOpenChange={setIsAddMeetingOpen} />
        </div>
    )
}
