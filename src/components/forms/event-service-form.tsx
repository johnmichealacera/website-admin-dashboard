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
    isActive: initialData?.isActive ?? true,
    isFeatured: initialData?.isFeatured ?? false,
    packages: initialData?.packages || [],
    duration: initialData?.duration || '',
    inclusions: [], // Moved to packages
    addOns: [], // Moved to packages
    freebies: [], // Moved to packages
    contactEmail: initialData?.contactEmail || '',
    contactPhone: initialData?.contactPhone || '',
    bookingUrl: initialData?.bookingUrl || '',
    tags: initialData?.tags || [],
    bgImage: initialData?.bgImage || '',
    siteId: currentSite?.id || '',
    servicePackages: initialData?.servicePackages?.map(pkg => ({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      inclusions: pkg.inclusions,
      addOns: pkg.addOns || [],
      freebies: pkg.freebies,
      isActive: pkg.isActive,
      sortOrder: pkg.sortOrder || 0,
      colorHexCode: pkg.colorHexCode || "#3B82F6"
    })) || []
  })

  const [newTag, setNewTag] = useState('')
  const [newPackage, setNewPackage] = useState('')
  const [newPackageDescription, setNewPackageDescription] = useState('')
  const [newPackageInclusion, setNewPackageInclusion] = useState('')
  const [newPackageFreebie, setNewPackageFreebie] = useState('')
  const [newPackageAddOn, setNewPackageAddOn] = useState<Partial<EventServiceAddOn>>({
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

    console.log('Submitting form data:', formData)
    console.log('Service packages:', formData.servicePackages)

    await onSubmit({
      ...formData,
      siteId: currentSite.id
    })
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

  const addPackage = () => {
    console.log('addPackage called')
    console.log('newPackage:', newPackage)
    
    if (newPackage.trim()) {
      const newPkg = {
        name: newPackage.trim(),
        description: newPackageDescription.trim() || null,
        price: 0, // Default to 0 since price is not displayed in UI
        inclusions: [],
        addOns: [],
        freebies: [],
        isActive: true,
        sortOrder: 0,
        colorHexCode: "#3B82F6"
      }
      
      console.log('Adding package:', newPkg)
      
      setFormData(prev => {
        const updated = {
          ...prev,
          packages: [...prev.packages, newPackage.trim()],
          servicePackages: [...(prev.servicePackages || []), newPkg]
        }
        console.log('Updated form data:', updated)
        return updated
      })
      
      setNewPackage('')
      setNewPackageDescription('')
      
      // Show success message
      alert('Package added successfully!')
    } else {
      console.log('Cannot add package - missing name')
      console.log('newPackage:', newPackage)
      alert('Please enter a package name')
    }
  }

  const removePackage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      packages: prev.packages.filter((_, i) => i !== index),
      servicePackages: (prev.servicePackages || []).filter((_, i) => i !== index)
    }))
  }

  const addPackageInclusion = (packageIndex: number) => {
    console.log('addPackageInclusion called for package:', packageIndex)
    console.log('newPackageInclusion:', newPackageInclusion)
    
    if (newPackageInclusion.trim()) {
      setFormData(prev => {
        const updated = {
          ...prev,
          servicePackages: (prev.servicePackages || []).map((pkg, i) => 
            i === packageIndex 
              ? { ...pkg, inclusions: [...pkg.inclusions, newPackageInclusion.trim()] }
              : pkg
          )
        }
        console.log('Updated form data after adding inclusion:', updated)
        return updated
      })
      setNewPackageInclusion('')
      alert('Inclusion added successfully!')
    } else {
      alert('Please enter an inclusion')
    }
  }

  const removePackageInclusion = (packageIndex: number, inclusionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      servicePackages: (prev.servicePackages || []).map((pkg, i) => 
        i === packageIndex 
          ? { ...pkg, inclusions: pkg.inclusions.filter((_, j) => j !== inclusionIndex) }
          : pkg
      )
    }))
  }

  const addPackageFreebie = (packageIndex: number) => {
    console.log('addPackageFreebie called for package:', packageIndex)
    console.log('newPackageFreebie:', newPackageFreebie)
    
    if (newPackageFreebie.trim()) {
      setFormData(prev => {
        const updated = {
          ...prev,
          servicePackages: (prev.servicePackages || []).map((pkg, i) => 
            i === packageIndex 
              ? { ...pkg, freebies: [...pkg.freebies, newPackageFreebie.trim()] }
              : pkg
          )
        }
        console.log('Updated form data after adding freebie:', updated)
        return updated
      })
      setNewPackageFreebie('')
      alert('Freebie added successfully!')
    } else {
      alert('Please enter a freebie')
    }
  }

  const removePackageFreebie = (packageIndex: number, freebieIndex: number) => {
    setFormData(prev => ({
      ...prev,
      servicePackages: (prev.servicePackages || []).map((pkg, i) => 
        i === packageIndex 
          ? { ...pkg, freebies: pkg.freebies.filter((_, j) => j !== freebieIndex) }
          : pkg
      )
    }))
  }

  const addPackageAddOn = (packageIndex: number) => {
    console.log('addPackageAddOn called for package:', packageIndex)
    console.log('newPackageAddOn:', newPackageAddOn)
    
    if (newPackageAddOn.name?.trim()) {
      const addOn = {
        name: newPackageAddOn.name.trim(),
        price: 0, // Default to 0 since price is not displayed in UI
        description: newPackageAddOn.description?.trim() || ''
      }
      
      setFormData(prev => {
        const updated = {
          ...prev,
          servicePackages: (prev.servicePackages || []).map((pkg, i) => 
            i === packageIndex 
              ? { ...pkg, addOns: [...(pkg.addOns || []), addOn] }
              : pkg
          )
        }
        console.log('Updated form data after adding add-on:', updated)
        return updated
      })
      
      setNewPackageAddOn({ name: '', price: 0, description: '' })
      alert('Add-on added successfully!')
    } else {
      alert('Please enter add-on name')
    }
  }

  const removePackageAddOn = (packageIndex: number, addOnIndex: number) => {
    setFormData(prev => ({
      ...prev,
      servicePackages: (prev.servicePackages || []).map((pkg, i) => 
        i === packageIndex 
          ? { ...pkg, addOns: (pkg.addOns || []).filter((_, j) => j !== addOnIndex) }
          : pkg
      )
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
          <div className="space-y-2">
            <Label htmlFor="name">Service Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Wedding, Debut, Birthday Party, etc."
              required
            />
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

          <div className="space-y-2">
            <Label htmlFor="bgImage">Background Image URL</Label>
            <Input
              id="bgImage"
              type="url"
              value={formData.bgImage || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, bgImage: e.target.value }))}
              placeholder="https://example.com/background-image.jpg"
            />
            <p className="text-xs text-gray-500">
              Optional: URL for a background image for this service
            </p>
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

      {/* Packages */}
      <Card>
        <CardHeader>
          <CardTitle>Packages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={newPackage}
              onChange={(e) => setNewPackage(e.target.value)}
              placeholder="Add a package (e.g., Silver, Gold, Platinum)..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPackage())}
            />
            <Button type="button" onClick={addPackage}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {formData.packages.map((pkg, index) => (
              <Badge key={index} variant="outline" className="flex items-center space-x-1 text-blue-600 border-blue-600">
                <span>{pkg}</span>
                <button
                  type="button"
                  onClick={() => removePackage(index)}
                  className="ml-1 text-red-500 hover:text-red-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>



      {/* Package Management */}
      <Card>
        <CardHeader>
          <CardTitle>Package Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Package */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input
              value={newPackage}
              onChange={(e) => setNewPackage(e.target.value)}
              placeholder="Package name (e.g., Silver, Gold, Platinum)"
            />
            <Input
              value={newPackageDescription}
              onChange={(e) => setNewPackageDescription(e.target.value)}
              placeholder="Package description"
            />
            <Button type="button" onClick={addPackage}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Package List */}
          <div className="space-y-4">
            {formData.servicePackages?.map((pkg, packageIndex) => (
              <div key={packageIndex} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-lg">{pkg.name}</h4>
                    {pkg.description && (
                      <p className="text-sm text-gray-500">{pkg.description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removePackage(packageIndex)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Package Inclusions */}
                <div className="mb-4">
                  <h5 className="font-medium mb-2">Inclusions</h5>
                  <div className="flex space-x-2 mb-2">
                    <Input
                      value={newPackageInclusion}
                      onChange={(e) => setNewPackageInclusion(e.target.value)}
                      placeholder="Add inclusion..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPackageInclusion(packageIndex))}
                    />
                    <Button 
                      type="button" 
                      onClick={() => addPackageInclusion(packageIndex)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {pkg.inclusions.map((inclusion, inclusionIndex) => (
                      <Badge key={inclusionIndex} variant="outline" className="flex items-center space-x-1">
                        <span>{inclusion}</span>
                        <button
                          type="button"
                          onClick={() => removePackageInclusion(packageIndex, inclusionIndex)}
                          className="ml-1 text-red-500 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Package Add-ons */}
                <div className="mb-4">
                  <h5 className="font-medium mb-2">Add-ons</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                    <Input
                      value={newPackageAddOn.name || ''}
                      onChange={(e) => setNewPackageAddOn(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Add-on name"
                    />
                    <Input
                      value={newPackageAddOn.description || ''}
                      onChange={(e) => setNewPackageAddOn(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description (optional)"
                    />
                    <Button 
                      type="button" 
                      onClick={() => addPackageAddOn(packageIndex)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {pkg.addOns?.map((addOn, addOnIndex) => (
                      <div key={addOnIndex} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium">{addOn.name}</p>
                          {addOn.description && (
                            <p className="text-sm text-gray-500">{addOn.description}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removePackageAddOn(packageIndex, addOnIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Package Freebies */}
                <div>
                  <h5 className="font-medium mb-2">Freebies</h5>
                  <div className="flex space-x-2 mb-2">
                    <Input
                      value={newPackageFreebie}
                      onChange={(e) => setNewPackageFreebie(e.target.value)}
                      placeholder="Add freebie..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPackageFreebie(packageIndex))}
                    />
                    <Button 
                      type="button" 
                      onClick={() => addPackageFreebie(packageIndex)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {pkg.freebies.map((freebie, freebieIndex) => (
                      <Badge key={freebieIndex} variant="outline" className="flex items-center space-x-1 text-green-600 border-green-600">
                        <span>{freebie}</span>
                        <button
                          type="button"
                          onClick={() => removePackageFreebie(packageIndex, freebieIndex)}
                          className="ml-1 text-red-500 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

{/* TODO: Decide if we need this */}
      {/* Contact Information */}
      {/* <Card>
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
      </Card> */}

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