'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ServiceFormData } from '@/lib/types'
import { createService, updateService } from '@/lib/actions/services'
import { Loader2, Upload, X } from 'lucide-react'
import { uploadToCloudinary } from "@/lib/utils/cloudinary-upload"
import { OptimizationStatus } from "@/components/ui/optimization-status"
import Image from 'next/image'
import { useTenant } from '@/contexts/tenant-context'

interface ServiceFormProps {
  initialData?: Partial<ServiceFormData>
  serviceId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function ServiceForm({ initialData, serviceId, onSuccess, onCancel }: ServiceFormProps) {
  const { currentSite } = useTenant()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState<ServiceFormData>({
    siteId: currentSite?.id || '',
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    iconUrl: initialData?.iconUrl || '',
    isFeatured: initialData?.isFeatured ?? false,
  })

  // Cloudinary configuration
  const cloudinaryUrl = process.env.NEXT_PUBLIC_CLOUDINARY_URL
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentSite?.id) {
      alert('No site selected')
      return
    }
    
    setIsSubmitting(true)

    try {
      const result = serviceId 
        ? await updateService(serviceId, formData, currentSite.id)
        : await createService(formData, currentSite.id)

      if (result.success) {
        onSuccess?.()
      } else {
        alert(result.error || 'Failed to save service')
      }
    } catch {
      alert('An error occurred while saving the service')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !cloudinaryUrl || !uploadPreset || !apiKey) return

    setIsUploading(true)
    try {
      const result = await uploadToCloudinary(file, {
        cloudinaryUrl,
        uploadPreset,
        apiKey,
        enableWebPOptimization: true,
        showOptimizationInfo: true
      })
      setFormData(prev => ({ ...prev, iconUrl: result.url }))
    } catch (error) {
      console.error('Error uploading icon:', error)
      alert('Failed to upload icon')
    } finally {
      setIsUploading(false)
    }
  }

  const removeIcon = () => {
    setFormData(prev => ({ ...prev, iconUrl: '' }))
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
        <CardTitle>
          {serviceId ? 'Edit Service' : 'Add New Service'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Service Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter service title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category || 'none'} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value === 'none' ? '' : value }))}>
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Category</SelectItem>
                  <SelectItem value="Electrical">Electrical</SelectItem>
                  <SelectItem value="Solar">Solar</SelectItem>
                  <SelectItem value="CCTV">CCTV</SelectItem>
                  <SelectItem value="Auxiliary">Auxiliary</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Installation">Installation</SelectItem>
                  <SelectItem value="Repair">Repair</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter service description"
              rows={4}
              required
            />
          </div>

          {/* Icon Upload */}
          <div className="space-y-2">
            <Label>Service Icon</Label>
            <div className="space-y-4">
              {formData.iconUrl ? (
                <div className="flex items-center space-x-4">
                  <div className="relative w-16 h-16">
                    <Image
                      src={formData.iconUrl}
                      alt="Service icon"
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeIcon}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove Icon
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upload service icon</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleIconUpload}
                    className="hidden"
                    id="icon-upload"
                  />
                  <label
                    htmlFor="icon-upload"
                    className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Choose File
                  </label>
                </div>
              )}
              
              {isUploading && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading icon...</span>
                </div>
              )}
              
              <OptimizationStatus />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isFeatured"
              checked={formData.isFeatured}
              onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isFeatured">Feature this service on homepage</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {serviceId ? 'Update Service' : 'Add Service'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 