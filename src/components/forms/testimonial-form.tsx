'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TestimonialFormData } from '@/lib/types'
import { createTestimonial, updateTestimonial } from '@/lib/actions/testimonials'
import { Loader2, Upload, X, Star } from 'lucide-react'
import { uploadToCloudinary } from "@/lib/utils/cloudinary-upload"
import { OptimizationStatus } from "@/components/ui/optimization-status"
import Image from 'next/image'
import { useTenant } from '@/contexts/tenant-context'

interface TestimonialFormProps {
  initialData?: Partial<TestimonialFormData>
  testimonialId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function TestimonialForm({ initialData, testimonialId, onSuccess, onCancel }: TestimonialFormProps) {
  const { currentSite } = useTenant()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState<TestimonialFormData>({
    siteId: currentSite?.id || '',
    clientName: initialData?.clientName || '',
    clientTitle: initialData?.clientTitle || '',
    content: initialData?.content || '',
    rating: initialData?.rating || null,
    avatarUrl: initialData?.avatarUrl || '',
    projectId: initialData?.projectId || '',
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
      const result = testimonialId 
        ? await updateTestimonial(testimonialId, formData, currentSite.id)
        : await createTestimonial(formData, currentSite.id)

      if (result.success) {
        onSuccess?.()
      } else {
        alert(result.error || 'Failed to save testimonial')
      }
    } catch {
      alert('An error occurred while saving the testimonial')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setFormData(prev => ({ ...prev, avatarUrl: result.url }))
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('Failed to upload avatar')
    } finally {
      setIsUploading(false)
    }
  }

  const removeAvatar = () => {
    setFormData(prev => ({ ...prev, avatarUrl: '' }))
  }

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({ ...prev, rating: prev.rating === rating ? null : rating }))
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
          {testimonialId ? 'Edit Testimonial' : 'Add New Testimonial'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name *</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                placeholder="Enter client name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientTitle">Client Title</Label>
              <Input
                id="clientTitle"
                value={formData.clientTitle || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, clientTitle: e.target.value }))}
                placeholder="e.g., Restaurant Owner, CEO"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Testimonial Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Enter the client's testimonial or review"
              rows={4}
              required
            />
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingChange(star)}
                  className={`p-1 rounded transition-colors ${
                    formData.rating && formData.rating >= star
                      ? 'text-yellow-500'
                      : 'text-gray-300 hover:text-yellow-400'
                  }`}
                >
                  <Star className="h-6 w-6 fill-current" />
                </button>
              ))}
              <span className="text-sm text-gray-600 ml-2">
                {formData.rating ? `${formData.rating}/5 stars` : 'No rating'}
              </span>
            </div>
          </div>

          {/* Avatar Upload */}
          <div className="space-y-2">
            <Label>Client Avatar</Label>
            <div className="space-y-4">
              {formData.avatarUrl ? (
                <div className="flex items-center space-x-4">
                  <div className="relative w-16 h-16">
                    <Image
                      src={formData.avatarUrl}
                      alt="Client avatar"
                      fill
                      className="object-cover rounded-full"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeAvatar}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove Avatar
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upload client avatar</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Choose File
                  </label>
                </div>
              )}
              
              {isUploading && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading avatar...</span>
                </div>
              )}
              
              <OptimizationStatus />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectId">Related Project ID</Label>
            <Input
              id="projectId"
              value={formData.projectId || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
              placeholder="Optional: Link to specific project/gallery item"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {testimonialId ? 'Update Testimonial' : 'Add Testimonial'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 