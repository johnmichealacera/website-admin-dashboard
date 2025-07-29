'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Wrench, Edit, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useTenant } from '@/contexts/tenant-context'
import { SiteFeature } from '@/lib/types'
import { ProductFeatureDescription as FeatureDescriptionConfig } from '@/components/forms/product-feature-description'
import { ServiceForm } from '@/components/forms/service-form'
import { Service } from '@/lib/types'
import { getServices, deleteService } from '@/lib/actions/services'

export default function ServicesPage() {
  const { currentSite } = useTenant()
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState<Service[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

  useEffect(() => {
    if (currentSite?.id) {
      loadServices()
    }
  }, [currentSite?.id])

  const loadServices = async () => {
    if (!currentSite?.id) return
    
    setLoading(true)
    try {
      const data = await getServices(currentSite.id)
      setServices(data)
    } catch (error) {
      console.error('Error loading services:', error)
    }
    setLoading(false)
  }

  const handleAddService = () => {
    setEditingService(null)
    setShowForm(true)
  }

  const handleEditService = (service: Service) => {
    setEditingService(service)
    setShowForm(true)
  }

  const handleDeleteService = async (id: string) => {
    if (!currentSite?.id) return
    
    if (!confirm('Are you sure you want to delete this service?')) {
      return
    }

    const result = await deleteService(id, currentSite.id)
    if (result.success) {
      loadServices()
    } else {
      alert(result.error || 'Failed to delete service')
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingService(null)
    loadServices()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingService(null)
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Services</h1>
            <p className="text-sm text-gray-500">
              {editingService ? 'Edit service' : 'Add new service'}
            </p>
          </div>
        </div>

        <ServiceForm
          initialData={editingService || undefined}
          serviceId={editingService?.id}
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
            Please select a site to manage services.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-sm text-gray-500">
            Manage your core services for {currentSite.name}
          </p>
        </div>
        <Button onClick={handleAddService}>
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>
      
      {/* Feature Description Config */}
      <Card>
        <CardHeader>
          <CardTitle>Services Feature Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <FeatureDescriptionConfig siteId={currentSite.id} featureName={SiteFeature.SERVICES} />
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Search Services</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Input
              placeholder="Search by title, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Services List */}
      <Card>
        <CardHeader>
          <CardTitle>All Services</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading services...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto mb-4 opacity-60">
                <Wrench className="h-12 w-12 mx-auto text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Services Yet
              </h3>
              <p className="text-gray-600 mb-4">
                Get started by adding your first service.
              </p>
              <Link href="/admin/services/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Service
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {services.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {service.iconUrl && (
                      <div className="relative w-12 h-12">
                        <Image
                          src={service.iconUrl}
                          alt={service.title}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900">{service.title}</h3>
                      <p className="text-sm text-gray-600">{service.description}</p>
                      {service.category && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-1">
                          {service.category}
                        </span>
                      )}
                      {service.isFeatured && (
                        <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mt-1 ml-1">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditService(service)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteService(service.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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