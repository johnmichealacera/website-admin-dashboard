'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GalleryItemFormData } from '@/lib/types'
import { createGalleryItem, updateGalleryItem } from '@/lib/actions/gallery'
import { Loader2, Upload, X, Plus } from 'lucide-react'
import { uploadToCloudinary } from "@/lib/utils/cloudinary-upload"
import { OptimizationStatus } from "@/components/ui/optimization-status"
import Image from 'next/image'
import { useTenant } from '@/contexts/tenant-context'

interface GalleryFormProps {
  initialData?: Partial<GalleryItemFormData>
  galleryItemId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function GalleryForm({ initialData, galleryItemId, onSuccess, onCancel }: GalleryFormProps) {
  const { currentSite } = useTenant()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [formData, setFormData] = useState<GalleryItemFormData>({
    siteId: currentSite?.id || '',
    title: initialData?.title || '',
    imageUrl: initialData?.imageUrl || '',
    description: initialData?.description || '',
    projectDate: initialData?.projectDate || null,
    tags: initialData?.tags || [],
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
      const result = galleryItemId 
        ? await updateGalleryItem(galleryItemId, formData, currentSite.id)
        : await createGalleryItem(formData, currentSite.id)

      if (result.success) {
        onSuccess?.()
      } else {
        alert(result.error || 'Failed to save gallery item')
      }
    } catch {
      alert('An error occurred while saving the gallery item')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setFormData(prev => ({ ...prev, imageUrl: result.url }))
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
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
        <CardTitle>
          {galleryItemId ? 'Edit Gallery Item' : 'Add New Gallery Item'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter title (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectDate">Project Date</Label>
              <Input
                id="projectDate"
                type="date"
                value={formData.projectDate ? new Date(formData.projectDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  projectDate: e.target.value ? new Date(e.target.value) : null 
                }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter description (optional)"
              rows={3}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Gallery Image *</Label>
            <div className="space-y-4">
              {formData.imageUrl ? (
                <div className="space-y-4">
                  <div className="relative w-full h-64">
                    <Image
                      src={formData.imageUrl}
                      alt="Gallery image"
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeImage}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upload gallery image</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    required
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Choose File
                  </label>
                </div>
              )}
              
              {isUploading && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading image...</span>
                </div>
              )}
              
              <OptimizationStatus />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="space-y-4">
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
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
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
            <Label htmlFor="isFeatured">Feature this item on homepage</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {galleryItemId ? 'Update Gallery Item' : 'Add Gallery Item'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 