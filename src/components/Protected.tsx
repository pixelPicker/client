import { useUser } from '../hooks/useAuth'
import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export function Protected({ children }: { children: React.ReactNode }) {
    const { data: user, isLoading, error } = useUser()
    const navigate = useNavigate()

    useEffect(() => {
        if (!isLoading && (!user || error)) {
            navigate({ to: '/login' })
        }
    }, [user, isLoading, error, navigate])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
            </div>
        )
    }

    if (!user || error) {
        return null // Will redirect in useEffect
    }

    return <>{children}</>
}
