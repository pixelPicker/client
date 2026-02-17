import { useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { useCreateMeeting } from '../hooks/useMeetings'
import { useContacts } from '../hooks/useContacts'
import { useDeals } from '../hooks/useDeals'
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

interface AddMeetingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddMeetingModal({ open, onOpenChange }: AddMeetingModalProps) {
  const {
    mutate: createMeeting,
    isPending: isLoading,
    error,
  } = useCreateMeeting()
  const { data: contacts } = useContacts()
  const { data: deals } = useDeals()

  const [formData, setFormData] = useState({
    title: '',
    clientId: '',
    dealId: '',
    dateTime: '',
    notes: '',
  })

  const availableDeals =
    deals?.filter((d) => d.clientId._id === formData.clientId) || []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMeeting(formData, {
      onSuccess: () => {
        onOpenChange(false)
        setFormData({
          title: '',
          clientId: '',
          dealId: '',
          dateTime: '',
          notes: '',
        })
      },
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Schedule Meeting</SheetTitle>
          <SheetDescription>
            Add a new meeting to your calendar.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client
            </label>
            <select
              value={formData.clientId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  clientId: e.target.value,
                  dealId: '',
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            >
              <option value="">Select a client</option>
              {contacts?.map((contact) => (
                <option key={contact._id} value={contact._id}>
                  {contact.name} - {contact.company}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deal (optional)
            </label>
            <select
              value={formData.dealId}
              onChange={(e) =>
                setFormData({ ...formData, dealId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">No deal</option>
              {availableDeals.map((deal) => (
                <option key={deal._id} value={deal._id}>
                  {deal.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date & Time
            </label>
            <Input
              type="datetime-local"
              value={formData.dateTime}
              onChange={(e) =>
                setFormData({ ...formData, dateTime: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          {error && (
            <div className="text-red-600 text-sm">
              Error: {(error as any).message}
            </div>
          )}
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
              <Save className="h-4 w-4 mr-2" />
            )}
            Schedule Meeting
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
