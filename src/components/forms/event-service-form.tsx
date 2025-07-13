'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Plus, X } from 'lucide-react'
import { useTenant } from '@/contexts/tenant-context'
import { EventService, EventServiceFormData, EventServiceAddOn } from '@/lib/types'

interface EventServiceFormProps {
  initialData?: EventService
  onSubmit: (data: EventServiceFormData) => Promise<void>
  isSubmitting?: boolean
}

export function EventServiceForm({ initialData, onSubmit, isSubmitting = false }: EventServiceFormProps) {
  const { currentSite } = useTenant()
  const [formData, setFormData] = useState<EventServiceFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    basePrice: initialData?.basePrice || 0,
    imageUrls: initialData?.imageUrls || [],
    isActive: initialData?.isActive ?? true,
    isFeatured: initialData?.isFeatured ?? false,
    category: initialData?.category || '',
    duration: initialData?.duration || '',
    inclusions: initialData?.inclusions || [],
    addOns: initialData?.addOns || [],
    freebies: initialData?.freebies || [],
    contactEmail: initialData?.contactEmail || '',
    contactPhone: initialData?.contactPhone || '',
    bookingUrl: initialData?.bookingUrl || '',
    tags: initialData?.tags || [],
    siteId: currentSite?.id || ''
  })

  const [newInclusion, setNewInclusion] = useState('')
  const [newFreebie, setNewFreebie] = useState('')
  const [newTag, setNewTag] = useState('')
  const [newAddOn, setNewAddOn] = useState<Partial<EventServiceAddOn>>({
    name: '',
    price: 0,
    description: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentSite) {
      alert('No site selected')
      return
    }

    await onSubmit({
      ...formData,
      siteId: currentSite.id
    })
  }

  const addInclusion = () => {
    if (newInclusion.trim()) {
      setFormData(prev => ({
        ...prev,
        inclusions: [...prev.inclusions, newInclusion.trim()]
      }))
      setNewInclusion('')
    }
  }

  const removeInclusion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      inclusions: prev.inclusions.filter((_, i) => i !== index)
    }))
  }

  const addFreebie = () => {
    if (newFreebie.trim()) {
      setFormData(prev => ({
        ...prev,
        freebies: [...prev.freebies, newFreebie.trim()]
      }))
      setNewFreebie('')
    }
  }

  const removeFreebie = (index: number) => {
    setFormData(prev => ({
      ...prev,
      freebies: prev.freebies.filter((_, i) => i !== index)
    }))
  }

  const addTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }))
  }

  const addAddOn = () => {
    if (newAddOn.name?.trim() && newAddOn.price !== undefined) {
      setFormData(prev => ({
        ...prev,
        addOns: [...(prev.addOns || []), {
          name: newAddOn.name!.trim(),
          price: newAddOn.price!,
          description: newAddOn.description?.trim() || ''
        }]
      }))
      setNewAddOn({ name: '', price: 0, description: '' })
    }
  }

  const removeAddOn = (index: number) => {
    setFormData(prev => ({
      ...prev,
      addOns: prev.addOns?.filter((_, i) => i !== index) || []
    }))
  }

  if (!currentSite) {
    return (
      <div className="text-center py-12">
        <Sparkles className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">No site selected. Please select a site to continue.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Service Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Classic Wedding Package"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Wedding, Corporate, Birthday"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your event service package..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="basePrice">Base Price (₱)</Label>
              <Input
                id="basePrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.basePrice || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={formData.duration || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="e.g., Full Day, 4 Hours, Half Day"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isFeatured">Featured</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Inclusions */}
      <Card>
        <CardHeader>
          <CardTitle>Service Inclusions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={newInclusion}
              onChange={(e) => setNewInclusion(e.target.value)}
              placeholder="Add an inclusion..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInclusion())}
            />
            <Button type="button" onClick={addInclusion}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {formData.inclusions.map((inclusion, index) => (
              <Badge key={index} variant="outline" className="flex items-center space-x-1">
                <span>{inclusion}</span>
                <button
                  type="button"
                  onClick={() => removeInclusion(index)}
                  className="ml-1 text-red-500 hover:text-red-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add-ons */}
      <Card>
        <CardHeader>
          <CardTitle>Add-ons</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <Input
              value={newAddOn.name || ''}
              onChange={(e) => setNewAddOn(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Add-on name"
            />
            <Input
              type="number"
              min="0"
              step="0.01"
              value={newAddOn.price || ''}
              onChange={(e) => setNewAddOn(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              placeholder="Price (₱)"
            />
            <Input
              value={newAddOn.description || ''}
              onChange={(e) => setNewAddOn(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description (optional)"
            />
            <Button type="button" onClick={addAddOn}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            {formData.addOns?.map((addOn, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{addOn.name}</p>
                  <p className="text-sm text-gray-600">₱{addOn.price.toFixed(2)}</p>
                  {addOn.description && (
                    <p className="text-sm text-gray-500">{addOn.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeAddOn(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Freebies */}
      <Card>
        <CardHeader>
          <CardTitle>Freebies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={newFreebie}
              onChange={(e) => setNewFreebie(e.target.value)}
              placeholder="Add a freebie..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFreebie())}
            />
            <Button type="button" onClick={addFreebie}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {formData.freebies.map((freebie, index) => (
              <Badge key={index} variant="outline" className="flex items-center space-x-1 text-green-600 border-green-600">
                <span>{freebie}</span>
                <button
                  type="button"
                  onClick={() => removeFreebie(index)}
                  className="ml-1 text-red-500 hover:text-red-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact & Booking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                placeholder="service@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                value={formData.contactPhone || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                placeholder="+63 9XX XXX XXXX"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bookingUrl">Booking URL</Label>
            <Input
              id="bookingUrl"
              type="url"
              value={formData.bookingUrl || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, bookingUrl: e.target.value }))}
              placeholder="https://example.com/book"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button type="button" onClick={addTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="flex items-center space-x-1">
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="ml-1 text-red-500 hover:text-red-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Service' : 'Create Service'}
        </Button>
      </div>
    </form>
  )
} 