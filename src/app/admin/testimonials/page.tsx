'use client'

import { useState, useEffect } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, MessageSquare, Edit, Trash2, Star } from 'lucide-react'
import Image from 'next/image'
import { useTenant } from '@/contexts/tenant-context'
import { SiteFeature } from '@/lib/types'
import { ProductFeatureDescription as FeatureDescriptionConfig } from '@/components/forms/product-feature-description'
import { TestimonialForm } from '@/components/forms/testimonial-form'
import { Testimonial } from '@/lib/types'
import { getTestimonials, deleteTestimonial } from '@/lib/actions/testimonials'
import { formatDate } from '@/lib/utils'

export default function TestimonialsPage() {
  const { currentSite } = useTenant()
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)

  useEffect(() => {
    if (currentSite?.id) {
      loadTestimonials()
    }
  }, [currentSite?.id])

  const loadTestimonials = async () => {
    if (!currentSite?.id) return
    
    setLoading(true)
    try {
      const data = await getTestimonials(currentSite.id)
      setTestimonials(data)
    } catch (error) {
      console.error('Error loading testimonials:', error)
    }
    setLoading(false)
  }

  const handleAddTestimonial = () => {
    setEditingTestimonial(null)
    setShowForm(true)
  }

  const handleEditTestimonial = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial)
    setShowForm(true)
  }

  const handleDeleteTestimonial = async (id: string) => {
    if (!currentSite?.id) return
    
    if (!confirm('Are you sure you want to delete this testimonial?')) {
      return
    }

    const result = await deleteTestimonial(id, currentSite.id)
    if (result.success) {
      loadTestimonials()
    } else {
      alert(result.error || 'Failed to delete testimonial')
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingTestimonial(null)
    loadTestimonials()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingTestimonial(null)
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Testimonials</h1>
            <p className="text-sm text-gray-500">
              {editingTestimonial ? 'Edit testimonial' : 'Add new testimonial'}
            </p>
          </div>
        </div>

        <TestimonialForm
          initialData={editingTestimonial || undefined}
          testimonialId={editingTestimonial?.id}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </div>
    )
  }

  if (!currentSite) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Site Selected
          </h3>
          <p className="text-gray-600">
            Please select a site to manage testimonials.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Testimonials</h1>
          <p className="text-sm text-gray-500">
            Manage client feedback and reviews for {currentSite.name}
          </p>
        </div>
        <Button onClick={handleAddTestimonial}>
          <Plus className="h-4 w-4 mr-2" />
          Add Testimonial
        </Button>
      </div>
      
      {/* Feature Description Config */}
      <Card>
        <CardHeader>
          <CardTitle>Testimonials Feature Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <FeatureDescriptionConfig siteId={currentSite.id} featureName={SiteFeature.TESTIMONIALS} />
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Search Testimonials</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Input
              placeholder="Search by client name, title, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Testimonials List */}
      <Card>
        <CardHeader>
          <CardTitle>All Testimonials</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading testimonials...</p>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto mb-4 opacity-60">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Testimonials Yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start building trust by adding client testimonials and reviews.
              </p>
              <Button onClick={handleAddTestimonial}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Testimonial
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="border rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    {testimonial.avatarUrl && (
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={testimonial.avatarUrl}
                          alt={testimonial.clientName}
                          fill
                          className="object-cover rounded-full"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">{testimonial.clientName}</h3>
                          {testimonial.clientTitle && (
                            <p className="text-sm text-gray-600">{testimonial.clientTitle}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {testimonial.rating && (
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= testimonial.rating!
                                      ? 'text-yellow-500 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditTestimonial(testimonial)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteTestimonial(testimonial.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-2">{testimonial.content}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{formatDate(testimonial.createdAt)}</span>
                        {testimonial.projectId && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Project: {testimonial.projectId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 