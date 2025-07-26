'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EventFormData, EventServicePackage } from '@/lib/types'
import { createEvent, updateEvent } from '@/lib/actions/events'
import { getEventServicePackages } from '@/lib/actions/event-services'
import { Loader2, Calendar, MapPin, Upload, X } from 'lucide-react'
import { uploadMultipleToCloudinary } from "@/lib/utils/cloudinary-upload";
import { OptimizationStatus } from "@/components/ui/optimization-status";
import Image from 'next/image'
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
  const [isUploading, setIsUploading] = useState(false)
  const [servicePackages, setServicePackages] = useState<EventServicePackage[]>([])
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
    isConfirmed: initialData?.isConfirmed ?? false,
    tags: initialData?.tags || [],
    contactEmail: initialData?.contactEmail || '',
    contactPhone: initialData?.contactPhone || '',
    contactName: initialData?.contactName || '',
    eventServicePackageId: initialData?.eventServicePackageId || null,
  })

  const [tagInput, setTagInput] = useState('')

  // Cloudinary configuration
  const cloudinaryUrl = process.env.NEXT_PUBLIC_CLOUDINARY_URL
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY

  useEffect(() => {
    if (currentSite?.id) {
      loadServicePackages()
    }
  }, [currentSite?.id])

  const loadServicePackages = async () => {
    if (!currentSite?.id) return
    
    try {
      const response = await getEventServicePackages(currentSite.id)
      if (response.success && response.data) {
        setServicePackages(response.data)
      }
    } catch (error) {
      console.error('Error loading service packages:', error)
    }
  }

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Check if adding these files would exceed the 3 image limit
    const remainingSlots = 3 - formData.imageUrls.length
    if (remainingSlots <= 0) {
      alert('Maximum of 3 images allowed for events')
      return
    }

    if (!cloudinaryUrl || !uploadPreset || !apiKey) {
      alert('Cloudinary configuration is missing. Please check your environment variables.')
      return
    }

    setIsUploading(true)
    
    try {
      // Only upload as many files as we have slots for
      const filesToUpload = Array.from(files).slice(0, remainingSlots)
      
      const results = await uploadMultipleToCloudinary(filesToUpload, {
        cloudinaryUrl,
        uploadPreset,
        apiKey,
        enableWebPOptimization: true,
        showOptimizationInfo: true
      })

      const validUrls = results.map(result => result.url).filter(url => url && url.trim() !== '')

      if (validUrls.length > 0) {
        setFormData(prev => ({
          ...prev,
          imageUrls: [...prev.imageUrls, ...validUrls] as string[]
        }))
      }

      if (files.length > remainingSlots) {
        alert(`Only ${remainingSlots} image(s) were uploaded. Maximum of 3 images allowed.`)
      }
    } catch (err) {
      console.error('Error uploading files:', err)
      alert('Failed to upload images. Please try again.')
    } finally {
      setIsUploading(false)
      // Reset the input
      e.target.value = ''
    }
  }

  const removeImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, index) => index !== indexToRemove)
    }))
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
          {eventId ? 'Edit Booking' : 'Add New Booking'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="title">Booking Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter booking title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter booking description"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="servicePackage">Service Package (Optional)</Label>
              <Select 
                value={formData.eventServicePackageId || undefined} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, eventServicePackageId: value || null }))}
              >
                <SelectTrigger id="servicePackage" className="w-full">
                  <SelectValue placeholder="Select a service package (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {servicePackages.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.eventService?.name} - {pkg.name}
                      {pkg.price && pkg.price > 0 && ` (₱${pkg.price.toLocaleString()})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Link this booking to a specific service package for better organization
              </p>
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

            <div className="space-y-2">
              <Label htmlFor="maxAttendees">Maximum Attendees</Label>
              <Input
                id="maxAttendees"
                type="number"
                min="1"
                value={formData.maxAttendees || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, maxAttendees: e.target.value ? parseInt(e.target.value) : null }))}
                placeholder="Enter maximum number of attendees"
              />
            </div>
          </div>

          {/* Contact Person */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Person</h3>
            
            <div className="space-y-2">
              <Label htmlFor="contactName">Contact Name</Label>
              <Input
                id="contactName"
                value={formData.contactName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                placeholder="Enter contact person name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="Enter contact email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={formData.contactPhone || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  placeholder="Enter contact phone number"
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

          {/* Event Images */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Booking Images (Max 3)
              </h3>
              <OptimizationStatus showDetails={true} />
            </div>
            
            {/* Image Upload */}
            <div className="space-y-2">
              <div className="flex items-center justify-center w-full">
                <label htmlFor="imageUpload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  {isUploading ? (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                      <p className="text-sm text-gray-500">Uploading images...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> booking images
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB (Max 3 images) • {3 - formData.imageUrls.length} remaining
                      </p>
                    </div>
                  )}
                  <input
                    id="imageUpload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={isUploading || formData.imageUrls.length >= 3}
                  />
                </label>
              </div>
            </div>

            {/* Image Preview */}
            {formData.imageUrls.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Images ({formData.imageUrls.length}/3)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.imageUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                        <Image
                          width={100}
                          height={100}
                          src={url}
                          alt={`Event image ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback for broken images
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.parentElement?.insertAdjacentHTML('afterbegin', 
                              `<div class="w-full h-full flex items-center justify-center text-gray-400">
                                <div class="text-center">
                                  <svg class="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                                  </svg>
                                  <p class="text-xs">Image Error</p>
                                </div>
                              </div>`
                            )
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                        title="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isConfirmed"
                  checked={formData.isConfirmed}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isConfirmed: checked as boolean }))}
                />
                <Label htmlFor="isConfirmed">Booking is confirmed</Label>
              </div>
                        </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {eventId ? 'Update Booking' : 'Add Booking'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 