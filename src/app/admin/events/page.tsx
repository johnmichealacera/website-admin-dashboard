'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EventForm } from '@/components/forms/event-form'
import { Plus, Calendar, Edit, Trash2, MapPin, Clock, Star } from 'lucide-react'
import { Event } from '@/lib/types'
import { getEvents, deleteEvent } from '@/lib/actions/events'
import { useTenant } from '@/contexts/tenant-context'

export default function EventsPage() {
  const { currentSite } = useTenant()
  const [events, setEvents] = useState<Event[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentSite?.id) {
      loadEvents()
    }
  }, [currentSite?.id])

  const loadEvents = async () => {
    if (!currentSite?.id) return
    
    setLoading(true)
    const data = await getEvents(currentSite.id)
    setEvents(data)
    setLoading(false)
  }

  const handleAddEvent = () => {
    setEditingEvent(null)
    setShowForm(true)
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setShowForm(true)
  }

  const handleDeleteEvent = async (id: string) => {
    if (!currentSite?.id) return
    
    if (!confirm('Are you sure you want to delete this event?')) {
      return
    }

    const result = await deleteEvent(id, currentSite.id)
    if (result.success) {
      loadEvents()
    } else {
      alert(result.error || 'Failed to delete event')
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingEvent(null)
    loadEvents()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingEvent(null)
  }

  const formatEventDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(date))
  }

  const isEventPast = (date: Date) => {
    return new Date(date) < new Date()
  }

  const isEventToday = (date: Date) => {
    const today = new Date()
    const eventDate = new Date(date)
    return eventDate.toDateString() === today.toDateString()
  }

  // Show message if no site is selected
  if (!currentSite) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Site Selected
          </h3>
          <p className="text-gray-600">
            Please select a site to manage events.
          </p>
        </div>
      </div>
    )
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Events</h1>
            <p className="text-sm text-gray-500">
              {editingEvent ? 'Edit event' : 'Add new event'}
            </p>
          </div>
        </div>

        <EventForm
          initialData={editingEvent || undefined}
          eventId={editingEvent?.id}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-sm text-gray-500">
            Manage your business events and activities for {currentSite.name}
          </p>
        </div>
        <Button onClick={handleAddEvent}>
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Event Calendar ({events.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No events yet
              </h3>
              <p className="text-gray-600 mb-4">
                Get started by creating your first event to engage with your customers.
              </p>
              <Button onClick={handleAddEvent}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Event
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {events.map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start space-x-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {event.title}
                              </h3>
                              
                              {event.isFeatured && (
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              )}
                              
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                !event.isActive 
                                  ? 'bg-gray-100 text-gray-800' 
                                  : isEventPast(event.startDate)
                                  ? 'bg-red-100 text-red-800'
                                  : isEventToday(event.startDate)
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {!event.isActive 
                                  ? 'Inactive' 
                                  : isEventPast(event.startDate)
                                  ? 'Past'
                                  : isEventToday(event.startDate)
                                  ? 'Today'
                                  : 'Upcoming'
                                }
                              </span>
                            </div>
                            
                            {event.description && (
                              <p className="text-gray-600 mb-3">
                                {event.description}
                              </p>
                            )}
                            
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {formatEventDate(event.startDate)}
                                  {event.endDate && ` - ${formatEventDate(event.endDate)}`}
                                </span>
                              </div>
                              
                              {event.location && (
                                <div className="flex items-center space-x-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>{event.location}</span>
                                </div>
                              )}
                            </div>
                            
                            {event.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-3">
                                {event.tags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditEvent(event)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 