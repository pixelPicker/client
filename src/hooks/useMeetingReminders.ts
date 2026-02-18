import { useRef, useEffect } from 'react'
import { useCalendar } from './useMeetings'
import { toast } from './useToast'

export function useMeetingReminders() {
    // Fetch meetings for today/upcoming. 
    // We use a broader range to capture everything, or rely on 'upcoming' logic.
    // Ideally we fetch for "today" specifically or just check the list we get.
    // Here we fetch a reasonable amount.
    const { data: meetingsData } = useCalendar('', 1, 50)

    // Keep track of notified meetings to avoid spam
    const notifiedRef = useRef<Set<string>>(new Set())

    useEffect(() => {
        if (!meetingsData?.data) return

        const checkReminders = () => {
            const now = new Date()

            meetingsData.data.forEach((meeting: any) => {
                const meetingTime = new Date(meeting.dateTime)
                const timeDiff = meetingTime.getTime() - now.getTime()
                const minutesUntil = Math.floor(timeDiff / 1000 / 60)

                // Logic: 
                // 1. Meeting is in the future (minutesUntil > 0)
                // 2. Meeting is within 15 minutes (minutesUntil <= 15)
                // 3. Haven't notified yet
                if (minutesUntil <= 15 && minutesUntil >= 0 && !notifiedRef.current.has(meeting._id)) {

                    // Trigger notification
                    toast.info(`🔔 Upcoming Meeting: "${meeting.title}" starts in ${minutesUntil} minutes!`, 10000)

                    // Mark as notified
                    notifiedRef.current.add(meeting._id)

                    // Optional: Play a sound?
                }
            })
        }

        // Check immediately
        checkReminders()

        // Check every minute
        const interval = setInterval(checkReminders, 60000)

        return () => clearInterval(interval)
    }, [meetingsData]) // Re-run if data changes (new meetings added)
}
