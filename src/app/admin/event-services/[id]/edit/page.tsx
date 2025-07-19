'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { EventServiceForm } from '@/components/forms/event-service-form'
import { EventService, EventServiceFormData } from '@/lib/types'
import { getEventService, updateEventService } from '@/lib/actions/event-services'
import { useTenant } from '@/contexts/tenant-context'

interface EditEventServicePageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditEventServicePage({ params }: EditEventServicePageProps) {
  const router = useRouter()
  const { currentSite } = useTenant()
  const [eventService, setEventService] = useState<EventService | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [serviceId, setServiceId] = useState<string | null>(null)

  useEffect(() => {
    // Get the service ID from params
    const getServiceId = async () => {
      const resolvedParams = await params
      setServiceId(resolvedParams.id)
    }
    getServiceId()
  }, [params])

  useEffect(() => {
    if (currentSite && serviceId) {
      loadEventService()
    }
  }, [currentSite, serviceId])

  const loadEventService = async () => {
    if (!currentSite || !serviceId) return
    
    setLoading(true)
    try {
      const response = await getEventService(serviceId, currentSite.id)
      if (response.success && response.data) {
        setEventService(response.data)
      } else {
        alert(response.error || 'Event service not found')
        router.push('/admin/event-services')
      }
    } catch (error) {
      console.error('Error loading event service:', error)
      alert('Failed to load event service')
      router.push('/admin/event-services')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: EventServiceFormData) => {
    if (!currentSite) return
    
    setIsSubmitting(true)
    try {
      const response = await updateEventService(serviceId!, data, currentSite.id)
      if (response.success) {
        router.push('/admin/event-services')
      } else {
        alert(response.error || 'Failed to update event service')
      }
    } catch (error) {
      console.error('Error updating event service:', error)
      alert('Failed to update event service')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event service...</p>
        </div>
      </div>
    )
  }

  if (!eventService) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Event service not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Booking Service</h1>
        <p className="text-gray-600">Update your event service package details</p>
      </div>

      <EventServiceForm
        initialData={eventService}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  )
} 