'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { EventFormData } from '@/lib/types'
import { createEvent, updateEvent } from '@/lib/actions/events'
import { Loader2, Calendar, MapPin, Users, DollarSign, Phone, Mail, Globe } from 'lucide-react'
import { useTenant } from '@/contexts/tenant-context'

interface EventFormProps {
  initialData?: Partial<EventFormData>
  eventId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function EventForm({ initialData, eventId, onSuccess, onCancel }: EventFormProps) {
  const { currentSite } = useTenant()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<EventFormData>({
    siteId: currentSite?.id || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    startDate: initialData?.startDate || new Date(),
    endDate: initialData?.endDate || null,
    location: initialData?.location || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    province: initialData?.province || '',
    zipCode: initialData?.zipCode || '',
    country: initialData?.country || '',
    price: initialData?.price || 0,
    maxAttendees: initialData?.maxAttendees || null,
    imageUrls: initialData?.imageUrls || [],
    isActive: initialData?.isActive ?? true,
    isFeatured: initialData?.isFeatured ?? false,
    tags: initialData?.tags || [],
    contactEmail: initialData?.contactEmail || '',
    contactPhone: initialData?.contactPhone || '',
    websiteUrl: initialData?.websiteUrl || '',
  })

  const [tagInput, setTagInput] = useState('')

  const formatDateTimeLocal = (date: Date | null) => {
    if (!date) return ''
    const d = new Date(date)
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
    return d.toISOString().slice(0, 16)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentSite?.id) {
      alert('No site selected')
      return
    }
    
    setIsSubmitting(true)

    try {
      const result = eventId 
        ? await updateEvent(eventId, formData, currentSite.id)
        : await createEvent(formData, currentSite.id)

      if (result.success) {
        onSuccess?.()
      } else {
        alert(result.error || 'Failed to save event')
      }
    } catch {
      alert('An error occurred while saving the event')
    } finally {
      setIsSubmitting(false)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ 
        ...prev, 
        tags: [...prev.tags, tagInput.trim()] 
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  // Show message if no site is selected
  if (!currentSite) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No site selected. Please select a site to continue.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          {eventId ? 'Edit Event' : 'Add New Event'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter event title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter event description"
                rows={4}
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Date and Time</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formatDateTimeLocal(formData.startDate)}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: new Date(e.target.value) }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formatDateTimeLocal(formData.endDate)}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value ? new Date(e.target.value) : null }))}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Location
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="location">Venue Name</Label>
              <Input
                id="location"
                value={formData.location || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Enter venue name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter street address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Enter city"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="province">Province</Label>
                <Input
                  id="province"
                  value={formData.province || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, province: e.target.value }))}
                  placeholder="Enter province"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                  placeholder="Enter ZIP code"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                placeholder="Enter country"
              />
            </div>
          </div>

          {/* Pricing and Capacity */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Pricing and Capacity
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₱)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxAttendees" className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  Max Attendees
                </Label>
                <Input
                  id="maxAttendees"
                  type="number"
                  value={formData.maxAttendees || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxAttendees: e.target.value ? parseInt(e.target.value) : null }))}
                  placeholder="Unlimited"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tags</h3>
            
            <div className="flex space-x-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Enter tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline">
                Add Tag
              </Button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  Contact Email
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="Enter contact email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone" className="flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  Contact Phone
                </Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={formData.contactPhone || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  placeholder="Enter contact phone"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="websiteUrl" className="flex items-center">
                <Globe className="h-4 w-4 mr-1" />
                Website URL
              </Label>
              <Input
                id="websiteUrl"
                type="url"
                value={formData.websiteUrl || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                placeholder="https://example.com"
              />
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Settings</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked as boolean }))}
                />
                <Label htmlFor="isActive">Event is active</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked as boolean }))}
                />
                <Label htmlFor="isFeatured">Featured event</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {eventId ? 'Update Event' : 'Add Event'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 