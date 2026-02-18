import { useState, useEffect } from 'react'
import { Loader2, Save } from 'lucide-react'
import { useCreateMeeting, useCalendar } from '../hooks/useMeetings'
import { useContacts } from '../hooks/useContacts'
import { useDeals } from '../hooks/useDeals'
import { toast } from '../hooks/useToast'
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
  initialData?: {
    title?: string
    dateTime?: string
    clientId?: string
    dealId?: string
    notes?: string
  }
  onMeetingCreated?: (meeting: any) => void
}

export function AddMeetingModal({ open, onOpenChange, initialData, onMeetingCreated }: AddMeetingModalProps) {
  const {
    mutate: createMeeting,
    isPending: isLoading,
    error,
  } = useCreateMeeting()
  const { data: contactsResponse } = useContacts('', 1, 100)
  const { data: dealsResponse } = useDeals('', 1, 'all', 100)
  const { data: calendarResponse } = useCalendar('', 1, 1000, 'all')
  const contacts = contactsResponse?.data || []
  const deals = dealsResponse?.data || []
  const allMeetings = calendarResponse?.data || []

  // Use useEffect to update form data when initialData changes or modal opens
  const [formData, setFormData] = useState({
    title: '',
    clientId: '',
    dealId: '',
    dateTime: '',
    notes: '',
  })

  // Effect to reset/init form when open/initialData changes
  // We need this because initialData might change while component is mounted
  // But we only want to set it when opening
  useEffect(() => {
    if (open) {
      setFormData({
        title: initialData?.title || '',
        clientId: initialData?.clientId || '',
        dealId: initialData?.dealId || '',
        dateTime: (() => {
          if (!initialData?.dateTime) return '';
          try {
            const date = new Date(initialData.dateTime);
            if (isNaN(date.getTime())) return '';

            // Format to YYYY-MM-DDTHH:mm for datetime-local
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');

            return `${year}-${month}-${day}T${hours}:${minutes}`;
          } catch (e) {
            return '';
          }
        })(),
        notes: initialData?.notes || '',
      })
    }
  }, [open, initialData])

  const availableDeals =
    deals?.filter((d) => d.clientId?._id === formData.clientId) || []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Conflict Check
    if (formData.dateTime) {
      const selectedDate = new Date(formData.dateTime).getTime()
      const hasConflict = allMeetings.some(m => new Date(m.dateTime).getTime() === selectedDate)

      if (hasConflict) {
        const proceed = window.confirm("Conflict detected: Another meeting is scheduled for this exact time slot. Schedule anyway?")
        if (!proceed) return
      }
    }

    createMeeting(formData, {
      onSuccess: (data) => {
        toast.success("Meeting scheduled successfully.")
        onOpenChange(false)
        if (onMeetingCreated) onMeetingCreated(data);
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
              {availableDeals.map((deal: any) => (
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
