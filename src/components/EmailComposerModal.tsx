import { useState, useEffect } from 'react'
import { Loader2, Send } from 'lucide-react'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from './ui/sheet'
import { Button } from './ui/button'
import { Input } from './ui/input'

interface EmailComposerModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialData?: {
        to?: string
        subject?: string
        body?: string
    }
}

export function EmailComposerModal({ open, onOpenChange, initialData }: EmailComposerModalProps) {
    const [formData, setFormData] = useState({
        to: '',
        subject: '',
        body: '',
    })
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (open) {
            setFormData({
                to: initialData?.to || '',
                subject: initialData?.subject || '',
                body: initialData?.body || '',
            })
        }
    }, [open, initialData])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        // Mock sending email
        setTimeout(() => {
            setIsLoading(false)
            onOpenChange(false)
            alert("Email sent! (Simulated)")
            // Here we would call an API and also clear the pending action from the parent
        }, 1000)
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Compose Email</SheetTitle>
                    <SheetDescription>
                        Draft your follow-up email.
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="space-y-4 p-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            To
                        </label>
                        <Input
                            type="email"
                            value={formData.to}
                            onChange={(e) =>
                                setFormData({ ...formData, to: e.target.value })
                            }
                            placeholder="client@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subject
                        </label>
                        <Input
                            type="text"
                            value={formData.subject}
                            onChange={(e) =>
                                setFormData({ ...formData, subject: e.target.value })
                            }
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Body
                        </label>
                        <textarea
                            value={formData.body}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                setFormData({ ...formData, body: e.target.value })
                            }
                            rows={10}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
                        />
                    </div>

                </form>
                <SheetFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Send className="h-4 w-4 mr-2" />
                        )}
                        Send Email
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
