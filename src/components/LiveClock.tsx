import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

export function LiveClock() {
    const [time, setTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date())
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    return (
        <div className="flex items-center gap-2 text-gray-500 font-medium bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
            <Clock className="h-4 w-4 text-cyan-500" />
            <span className="text-sm tabular-nums">
                {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                <span className="mx-2 text-gray-300">|</span>
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
        </div>
    )
}
