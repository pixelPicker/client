import { useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { useCreateDeal } from '../hooks/useDeals'
import { useContacts } from '../hooks/useContacts'
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

interface AddDealModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AddDealModal({ open, onOpenChange }: AddDealModalProps) {
    const { mutate: createDeal, isPending: isLoading, error } = useCreateDeal()
    const { data: clientsResponse, isLoading: isClientsLoading } = useContacts('', 1, 100)
    const clients = clientsResponse?.data || []

    const [formData, setFormData] = useState({
        title: '',
        clientId: '',
        stage: 'Lead' as const,
        value: 0,
        status: 'active' as const,
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Cast to any to bypass type mismatch: API expects clientId as string, but Deal type has populated object
        createDeal(formData as any, {
            onSuccess: () => {
                onOpenChange(false)
                setFormData({
                    title: '',
                    clientId: '',
                    stage: 'Lead',
                    value: 0,
                    status: 'active',
                })
            },
        })
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'value' ? Number(value) : value,
        }))
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Add New Deal</SheetTitle>
                    <SheetDescription>
                        Create a new deal and assign it to a client.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-6 p-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                            {(error as any).message || 'An error occurred'}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="title" className="text-sm font-medium text-gray-700">
                                Deal Title
                            </label>
                            <Input
                                id="title"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., Q3 Software License"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="clientId" className="text-sm font-medium text-gray-700">
                                Client
                            </label>
                            {isClientsLoading ? (
                                <div className="text-sm text-gray-500 flex items-center">
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Loading clients...
                                </div>
                            ) : (
                                <select
                                    id="clientId"
                                    name="clientId"
                                    required
                                    value={formData.clientId}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm bg-white"
                                >
                                    <option value="">Select a client</option>
                                    {clients?.map((client) => (
                                        <option key={client._id} value={client._id}>
                                            {client.name} - {client.company}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="stage" className="text-sm font-medium text-gray-700">
                                Stage
                            </label>
                            <select
                                id="stage"
                                name="stage"
                                value={formData.stage}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm bg-white"
                            >
                                <option value="Lead">Lead</option>
                                <option value="Discovery">Discovery</option>
                                <option value="Qualified">Qualified</option>
                                <option value="Proposal Sent">Proposal Sent</option>
                                <option value="Negotiation">Negotiation</option>
                                <option value="Closed Won">Closed Won</option>
                                <option value="Closed Lost">Closed Lost</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="value" className="text-sm font-medium text-gray-700">
                                Value ($)
                            </label>
                            <Input
                                id="value"
                                name="value"
                                type="number"
                                min="0"
                                value={formData.value}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="status" className="text-sm font-medium text-gray-700">
                                Status
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm bg-white"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                    </div>

                    <SheetFooter className="pt-4 w-full">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Deal
                                </>
                            )}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    )
}
