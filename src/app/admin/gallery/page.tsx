'use client'

import { useState, useEffect } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Camera, Edit, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useTenant } from '@/contexts/tenant-context'
import { SiteFeature } from '@/lib/types'
import { ProductFeatureDescription as FeatureDescriptionConfig } from '@/components/forms/product-feature-description'
import { GalleryForm } from '@/components/forms/gallery-form'
import { GalleryItem } from '@/lib/types'
import { getGalleryItems, deleteGalleryItem } from '@/lib/actions/gallery'
import { formatDate } from '@/lib/utils'

export default function GalleryPage() {
  const { currentSite } = useTenant()
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingGalleryItem, setEditingGalleryItem] = useState<GalleryItem | null>(null)

  useEffect(() => {
    if (currentSite?.id) {
      loadGalleryItems()
    }
  }, [currentSite?.id])

  const loadGalleryItems = async () => {
    if (!currentSite?.id) return
    
    setLoading(true)
    try {
      const data = await getGalleryItems(currentSite.id)
      setGalleryItems(data)
    } catch (error) {
      console.error('Error loading gallery items:', error)
    }
    setLoading(false)
  }

  const handleAddGalleryItem = () => {
    setEditingGalleryItem(null)
    setShowForm(true)
  }

  const handleEditGalleryItem = (galleryItem: GalleryItem) => {
    setEditingGalleryItem(galleryItem)
    setShowForm(true)
  }

  const handleDeleteGalleryItem = async (id: string) => {
    if (!currentSite?.id) return
    
    if (!confirm('Are you sure you want to delete this gallery item?')) {
      return
    }

    const result = await deleteGalleryItem(id, currentSite.id)
    if (result.success) {
      loadGalleryItems()
    } else {
      alert(result.error || 'Failed to delete gallery item')
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingGalleryItem(null)
    loadGalleryItems()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingGalleryItem(null)
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
            <p className="text-sm text-gray-500">
              {editingGalleryItem ? 'Edit gallery item' : 'Add new gallery item'}
            </p>
          </div>
        </div>

        <GalleryForm
          initialData={editingGalleryItem || undefined}
          galleryItemId={editingGalleryItem?.id}
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
            Please select a site to manage gallery.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
          <p className="text-sm text-gray-500">
            Manage your project photos and portfolio for {currentSite.name}
          </p>
        </div>
        <Button onClick={handleAddGalleryItem}>
          <Plus className="h-4 w-4 mr-2" />
          Add Gallery Item
        </Button>
      </div>
      
      {/* Feature Description Config */}
      <Card>
        <CardHeader>
          <CardTitle>Gallery Feature Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <FeatureDescriptionConfig siteId={currentSite.id} featureName={SiteFeature.GALLERY} />
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Search Gallery</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Input
              placeholder="Search by title, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Gallery Items List */}
      <Card>
        <CardHeader>
          <CardTitle>All Gallery Items</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading gallery items...</p>
            </div>
          ) : galleryItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto mb-4 opacity-60">
                <Camera className="h-12 w-12 mx-auto text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Gallery Items Yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start showcasing your projects by adding photos to your gallery.
              </p>
              <Button onClick={handleAddGalleryItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Photo
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {galleryItems.map((item) => (
                <div key={item.id} className="border rounded-lg overflow-hidden">
                  <div className="relative h-48">
                    <Image
                      src={item.imageUrl}
                      alt={item.title || 'Gallery item'}
                      fill
                      className="object-cover"
                    />
                    {item.isFeatured && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                          Featured
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-1">
                      {item.title || 'Untitled'}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    {item.projectDate && (
                      <p className="text-xs text-gray-500 mb-2">
                        {formatDate(item.projectDate)}
                      </p>
                    )}
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                        {item.tags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{item.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditGalleryItem(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteGalleryItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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