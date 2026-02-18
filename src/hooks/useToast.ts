import { useState, useEffect, useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
    id: string
    message: string
    type: ToastType
    duration?: number
}

type ToastListener = (toast: Toast) => void
const listeners = new Set<ToastListener>()

export const toast = {
    add: (message: string, type: ToastType, duration = 5000) => {
        const id = Math.random().toString(36).substring(2, 9)
        const newToast = { id, message, type, duration }
        listeners.forEach(listener => listener(newToast))
        return id
    },
    success: (message: string, duration?: number) => toast.add(message, 'success', duration),
    error: (message: string, duration?: number) => toast.add(message, 'error', duration),
    info: (message: string, duration?: number) => toast.add(message, 'info', duration),
    warning: (message: string, duration?: number) => toast.add(message, 'warning', duration),
}

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([])

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    useEffect(() => {
        const listener: ToastListener = (newToast) => {
            setToasts((prev) => [...prev, newToast])

            if (newToast.duration !== Infinity) {
                setTimeout(() => {
                    removeToast(newToast.id)
                }, newToast.duration)
            }
        }

        listeners.add(listener)
        return () => {
            listeners.delete(listener)
        }
    }, [removeToast])

    return { toasts, removeToast }
}
