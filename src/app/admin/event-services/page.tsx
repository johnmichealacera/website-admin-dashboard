'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Plus, Search, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { useTenant } from '@/contexts/tenant-context'
import { EventService } from '@/lib/types'
import { getEventServices, deleteEventService, toggleEventServiceStatus } from '@/lib/actions/event-services'
import Link from 'next/link'
import { ProductFeatureDescription as FeatureDescriptionConfig } from '@/components/forms/product-feature-description';
import { SiteFeature } from '@/lib/types';
import { ZcalSettings } from '@/components/zcal-settings';
import { ZcalBookingButton } from '@/components/zcal-booking-button';
import { ZcalDebug } from '@/components/zcal-debug';

export default function EventServicesPage() {
  const { currentSite } = useTenant()
  const [eventServices, setEventServices] = useState<EventService[]>([])
  const [filteredServices, setFilteredServices] = useState<EventService[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentSite) {
      loadEventServices()
    }
  }, [currentSite])

  useEffect(() => {
    const filtered = eventServices.filter(service =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredServices(filtered)
  }, [eventServices, searchTerm])

  const loadEventServices = async () => {
    if (!currentSite) return
    
    setLoading(true)
    try {
      const response = await getEventServices(currentSite.id)
      if (response.success && response.data) {
        setEventServices(response.data)
      }
    } catch (error) {
      console.error('Error loading event services:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!currentSite) return
    
    if (confirm('Are you sure you want to delete this event service?')) {
      const response = await deleteEventService(id, currentSite.id)
      if (response.success) {
        loadEventServices()
      } else {
        alert(response.error || 'Failed to delete event service')
      }
    }
  }

  const handleToggleStatus = async (id: string) => {
    if (!currentSite) return
    
    const response = await toggleEventServiceStatus(id, currentSite.id)
    if (response.success) {
      loadEventServices()
    } else {
      alert(response.error || 'Failed to toggle event service status')
    }
  }

  const formatPrice = (price: number | null) => {
    if (!price) return 'Free'
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price)
  }

  // Show message if no site is selected
  if (!currentSite) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Sparkles className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Site Selected
          </h3>
          <p className="text-gray-600">
            Please select a site to manage event services.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Services</h1>
          <p className="text-sm text-gray-500">
            Manage your event services for {currentSite.name}
          </p>
        </div>
        <Link href="/admin/event-services/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Event Service
          </Button>
        </Link>
      </div>
      
      {/* Feature Description Config */}
      <Card>
        <CardHeader>
          <CardTitle>Event Services Feature Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <FeatureDescriptionConfig siteId={currentSite.id} featureName={SiteFeature.EVENT_SERVICES} />
        </CardContent>
      </Card>

      {/* Zcal Settings */}
      <ZcalSettings siteId={currentSite.id} />
      
      {/* Zcal Debug - Temporary */}
      <ZcalDebug siteId={currentSite.id} />

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
              placeholder="Search by name, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Services List */}
      <div className="grid gap-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading event services...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Sparkles className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No services found' : 'No event services yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Create your first event service package to get started'
                }
              </p>
              {!searchTerm && (
                <Link href="/admin/event-services/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredServices.map((service) => (
            <Card key={service.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {service.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant={service.isActive ? 'default' : 'secondary'}>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {service.isFeatured && (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                            Featured
                          </Badge>
                        )}
                        {service.category && (
                          <Badge variant="outline">
                            {service.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {service.description && (
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {service.description}
                      </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Base Price</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatPrice(service.basePrice)}
                        </p>
                      </div>
                      
                      {service.duration && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Duration</p>
                          <p className="text-gray-900">{service.duration}</p>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Inclusions</p>
                        <p className="text-gray-900">{service.inclusions.length} items</p>
                      </div>
                    </div>

                    {service.inclusions.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-500 mb-2">Key Inclusions:</p>
                        <div className="flex flex-wrap gap-1">
                          {service.inclusions.slice(0, 3).map((inclusion, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {inclusion}
                            </Badge>
                          ))}
                          {service.inclusions.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{service.inclusions.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {service.addOns && service.addOns.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-500 mb-2">Add-ons Available:</p>
                        <div className="flex flex-wrap gap-1">
                          {service.addOns.slice(0, 2).map((addOn, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {addOn.name} - {formatPrice(addOn.price)}
                            </Badge>
                          ))}
                          {service.addOns.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{service.addOns.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {service.freebies.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-2">Freebies:</p>
                        <div className="flex flex-wrap gap-1">
                          {service.freebies.slice(0, 3).map((freebie, index) => (
                            <Badge key={index} variant="outline" className="text-xs text-green-600 border-green-600">
                              {freebie}
                            </Badge>
                          ))}
                          {service.freebies.length > 3 && (
                            <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                              +{service.freebies.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(service.id)}
                    >
                      {service.isActive ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Link href={`/admin/event-services/${service.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    
                                         <ZcalBookingButton siteId={currentSite.id} serviceName={service.name} />

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(service.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 