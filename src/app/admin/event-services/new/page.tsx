'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EventServiceForm } from '@/components/forms/event-service-form'
import { EventServiceFormData } from '@/lib/types'
import { createEventService } from '@/lib/actions/event-services'

export default function NewEventServicePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: EventServiceFormData) => {
    setIsSubmitting(true)
    try {
      const response = await createEventService(data)
      if (response.success) {
        router.push('/admin/event-services')
      } else {
        alert(response.error || 'Failed to create event service')
      }
    } catch (error) {
      console.error('Error creating event service:', error)
      alert('Failed to create event service')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Event Service</h1>
        <p className="text-gray-600">Add a new event service package to your offerings</p>
      </div>

      <EventServiceForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  )
} 