import { useState, useEffect } from 'react'
import { Loader2, Save } from 'lucide-react'
import { useCreateContact, useUpdateContact } from '../hooks/useContacts'
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

interface AddClientModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialData?: any
}

export function AddClientModal({ open, onOpenChange, initialData }: AddClientModalProps) {
    const { mutate: createContact, isPending: isCreating, error: createError } = useCreateContact()
    const { mutate: updateContact, isPending: isUpdating, error: updateError } = useUpdateContact()

    const [formData, setFormData] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        dealStage: 'Lead',
        dealValue: 0,
        dealScore: 50,
    })

    const isLoading = isCreating || isUpdating
    const error = createError || updateError

    // Populate form when editing
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                company: initialData.company || '',
                email: initialData.email || '',
                phone: initialData.phone || '',
                dealStage: initialData.dealStage || 'Lead',
                dealValue: initialData.dealValue || 0,
                dealScore: initialData.dealScore || 50,
            })
        } else {
            setFormData({
                name: '',
                company: '',
                email: '',
                phone: '',
                dealStage: 'Lead',
                dealValue: 0,
                dealScore: 50,
            })
        }
    }, [initialData, open])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (initialData?._id) {
            // Update existing client
            updateContact({ id: initialData._id, data: formData }, {
                onSuccess: () => {
                    onOpenChange(false)
                },
            })
        } else {
            // Create new client
            createContact(formData, {
                onSuccess: () => {
                    onOpenChange(false)
                    setFormData({
                        name: '',
                        company: '',
                        email: '',
                        phone: '',
                        dealStage: 'Lead',
                        dealValue: 0,
                        dealScore: 50,
                    })
                },
            })
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'dealValue' || name === 'dealScore' ? Number(value) : value,
        }))
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{initialData ? 'Edit Client' : 'Add New Client'}</SheetTitle>
                    <SheetDescription>
                        {initialData ? 'Update client details and deal progress.' : 'Enter client details to track the deal progress.'}
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
                            <label htmlFor="name" className="text-sm font-medium text-gray-700">
                                Full Name
                            </label>
                            <Input
                                id="name"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="company" className="text-sm font-medium text-gray-700">
                                Company
                            </label>
                            <Input
                                id="company"
                                name="company"
                                required
                                value={formData.company}
                                onChange={handleChange}
                                placeholder="Acme Inc."
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="john@example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                                Phone
                            </label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="dealStage" className="text-sm font-medium text-gray-700">
                                Deal Stage
                            </label>
                            <select
                                id="dealStage"
                                name="dealStage"
                                value={formData.dealStage}
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
                            <label htmlFor="dealValue" className="text-sm font-medium text-gray-700">
                                Deal Value ($)
                            </label>
                            <Input
                                id="dealValue"
                                name="dealValue"
                                type="number"
                                min="0"
                                value={formData.dealValue}
                                onChange={handleChange}
                            />
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
                                    {initialData ? 'Update Client' : 'Save Client'}
                                </>
                            )}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    )
}
