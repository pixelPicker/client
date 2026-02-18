import { useToast } from '../hooks/useToast'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export function ToastProvider() {
    const { toasts, removeToast } = useToast()

    if (toasts.length === 0) return null

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-md w-full">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`
            flex items-start gap-3 p-4 rounded-xl shadow-lg border animate-in slide-in-from-right-4 fade-in duration-300
            ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                            toast.type === 'error' ? 'bg-red-50 border-red-100 text-red-800' :
                                toast.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800' :
                                    'bg-blue-50 border-blue-100 text-blue-800'}
          `}
                >
                    <div className="shrink-0 mt-0.5">
                        {toast.type === 'success' && <CheckCircle className="h-5 w-5 text-emerald-500" />}
                        {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                        {toast.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-500" />}
                        {toast.type === 'info' && <Info className="h-5 w-5 text-blue-500" />}
                    </div>

                    <div className="flex-1">
                        <p className="text-sm font-medium leading-relaxed">
                            {toast.message}
                        </p>
                    </div>

                    <button
                        onClick={() => removeToast(toast.id)}
                        className="shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors"
                    >
                        <X className="h-4 w-4 opacity-50" />
                    </button>
                </div>
            ))}
        </div>
    )
}
