'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EventForm } from '@/components/forms/event-form'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { Plus, Calendar, Edit, Trash2, MapPin, Clock, Star, CheckCircle, Users, Phone, Mail, User, Sparkles } from 'lucide-react'
import { Event } from '@/lib/types'
import { getEvents, deleteEvent, toggleEventFeatured, toggleEventConfirmed } from '@/lib/actions/events'
import { useTenant } from '@/contexts/tenant-context'
import { ProductFeatureDescription as FeatureDescriptionConfig } from '@/components/forms/product-feature-description';
import { SiteFeature } from '@/lib/types';

export default function EventsPage() {
  const { currentSite } = useTenant()
  const [events, setEvents] = useState<Event[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean
    type: 'delete' | 'feature' | 'confirm'
    eventId: string
    eventTitle: string
    currentStatus: boolean
  }>({
    isOpen: false,
    type: 'delete',
    eventId: '',
    eventTitle: '',
    currentStatus: false
  })

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
    
    const event = events.find(e => e.id === id)
    if (!event) return

    setConfirmationDialog({
      isOpen: true,
      type: 'delete',
      eventId: id,
      eventTitle: event.title,
      currentStatus: false
    })
  }

  const handleToggleFeatured = (event: Event) => {
    setConfirmationDialog({
      isOpen: true,
      type: 'feature',
      eventId: event.id,
      eventTitle: event.title,
      currentStatus: event.isFeatured
    })
  }

  const handleToggleConfirmed = (event: Event) => {
    setConfirmationDialog({
      isOpen: true,
      type: 'confirm',
      eventId: event.id,
      eventTitle: event.title,
      currentStatus: event.isConfirmed
    })
  }

  const handleConfirmAction = async () => {
    if (!currentSite?.id) return

    const { type, eventId } = confirmationDialog
    let result

    switch (type) {
      case 'delete':
        result = await deleteEvent(eventId, currentSite.id)
        break
      case 'feature':
        result = await toggleEventFeatured(eventId, currentSite.id)
        break
      case 'confirm':
        result = await toggleEventConfirmed(eventId, currentSite.id)
        break
    }

    if (result?.success) {
      loadEvents()
    } else {
      alert(result?.error || 'Failed to perform action')
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

  const getConfirmationDialogProps = () => {
    const { type, eventTitle, currentStatus } = confirmationDialog
    
    switch (type) {
      case 'delete':
        return {
          title: 'Delete Booking',
          message: `Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`,
          confirmText: 'Delete Booking',
          type: 'delete' as const
        }
      case 'feature':
        return {
          title: currentStatus ? 'Remove from Featured' : 'Mark as Featured',
          message: currentStatus 
            ? `Remove "${eventTitle}" from featured bookings?`
            : `Mark "${eventTitle}" as a featured booking?`,
          confirmText: currentStatus ? 'Remove Featured' : 'Mark Featured',
          type: 'feature' as const
        }
      case 'confirm':
        return {
          title: currentStatus ? 'Mark as Unconfirmed' : 'Confirm Booking',
          message: currentStatus 
            ? `Mark "${eventTitle}" as unconfirmed?`
            : `Confirm "${eventTitle}" booking?`,
          confirmText: currentStatus ? 'Mark Unconfirmed' : 'Confirm Booking',
          type: 'confirm' as const
        }
    }
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
            Please select a site to manage bookings.
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
            <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
            <p className="text-sm text-gray-500">
              {editingEvent ? 'Edit booking' : 'Add new booking'}
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
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-sm text-gray-500">
            Manage your bookings for {currentSite.name}
          </p>
        </div>
        <Button onClick={handleAddEvent}>
          <Plus className="h-4 w-4 mr-2" />
          Add Booking
        </Button>
      </div>
      
      {/* Feature Description Config */}
      <Card>
        <CardHeader>
          <CardTitle>Bookings Feature Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <FeatureDescriptionConfig siteId={currentSite.id} featureName={SiteFeature.EVENTS} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Booking Calendar ({events.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading bookings...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No bookings yet
              </h3>
              <p className="text-gray-600 mb-4">
                Get started by creating your first booking to engage with your customers.
              </p>
              <Button onClick={handleAddEvent}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Booking
              </Button>
            </div>
          ) : (
            <div className="grid gap-6">
              {events.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      {/* Main Content */}
                      <div className="flex-1 space-y-4">
                        {/* Header with title and status badges */}
                        <div className="flex flex-wrap items-start gap-2">
                          <h3 className="text-xl font-semibold text-gray-900 flex-1 min-w-0">
                            {event.title}
                          </h3>
                          
                          {/* Status badges */}
                          <div className="flex flex-wrap gap-2">
                            {event.isFeatured && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Star className="h-3 w-3 mr-1" />
                                Featured
                              </span>
                            )}
                            
                            {event.isConfirmed && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Confirmed
                              </span>
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
                        </div>
                        
                        {/* Description */}
                        {event.description && (
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {event.description}
                          </p>
                        )}
                        
                        {/* Event Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* Date and Time */}
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium">Date & Time</div>
                              <div>{formatEventDate(event.startDate)}</div>
                              {event.endDate && (
                                <div className="text-xs text-gray-500">to {formatEventDate(event.endDate)}</div>
                              )}
                            </div>
                          </div>
                          
                          {/* Location */}
                          {event.location && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <div>
                                <div className="font-medium">Location</div>
                                <div>{event.location}</div>
                                {event.address && (
                                  <div className="text-xs text-gray-500">{event.address}</div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Max Attendees */}
                          {event.maxAttendees && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Users className="h-4 w-4 text-gray-400" />
                              <div>
                                <div className="font-medium">Max Attendees</div>
                                <div>{event.maxAttendees} people</div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Contact Information */}
                        {(event.contactName || event.contactEmail || event.contactPhone) && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Contact Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {event.contactName && (
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <User className="h-4 w-4 text-gray-400" />
                                  <span>{event.contactName}</span>
                                </div>
                              )}
                              {event.contactEmail && (
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <Mail className="h-4 w-4 text-gray-400" />
                                  <span>{event.contactEmail}</span>
                                </div>
                              )}
                              {event.contactPhone && (
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <Phone className="h-4 w-4 text-gray-400" />
                                  <span>{event.contactPhone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Tags */}
                        {event.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {event.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Service Package Information */}
                        {event.eventServicePackage && (
                          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                              <Sparkles className="h-4 w-4 mr-2" />
                              Linked Service Package
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-blue-800">
                                  {event.eventServicePackage.eventService?.name} - {event.eventServicePackage.name}
                                </span>
                                {event.eventServicePackage.price && event.eventServicePackage.price > 0 && (
                                  <span className="text-sm font-semibold text-blue-900">
                                    ₱{event.eventServicePackage.price.toLocaleString()}
                                  </span>
                                )}
                              </div>
                              {event.eventServicePackage.description && (
                                <p className="text-xs text-blue-700">
                                  {event.eventServicePackage.description}
                                </p>
                              )}
                              {event.eventServicePackage.inclusions.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium text-blue-800 mb-1">Inclusions:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {event.eventServicePackage.inclusions.slice(0, 3).map((inclusion, idx) => (
                                      <span
                                        key={idx}
                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                      >
                                        {inclusion}
                                      </span>
                                    ))}
                                    {event.eventServicePackage.inclusions.length > 3 && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                        +{event.eventServicePackage.inclusions.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleFeatured(event)}
                          className="justify-start"
                        >
                          <Star className={`h-4 w-4 mr-2 ${event.isFeatured ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                          {event.isFeatured ? 'Unfeature' : 'Feature'}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleConfirmed(event)}
                          className="justify-start"
                        >
                          <CheckCircle className={`h-4 w-4 mr-2 ${event.isConfirmed ? 'text-green-500 fill-current' : 'text-gray-400'}`} />
                          {event.isConfirmed ? 'Unconfirm' : 'Confirm'}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditEvent(event)}
                          className="justify-start"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                          className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
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

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        onClose={() => setConfirmationDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmAction}
        {...getConfirmationDialogProps()}
      />
    </div>
  )
} 