'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Tags, Calendar, Sparkles, CheckCircle, XCircle } from 'lucide-react'
import { useTenant } from '@/contexts/tenant-context'
import { getProductsStats } from '@/lib/actions/products'
import { getCategories } from '@/lib/actions/categories'
import { getEvents } from '@/lib/actions/events'
import { getEventServicesStats } from '@/lib/actions/event-services'
import { getAbout } from '@/lib/actions/about'
import { getContact } from '@/lib/actions/contact'
import { useState, useEffect } from 'react'
import { SiteFeature } from '@/lib/types'

interface DynamicMetric {
  feature: SiteFeature
  title: string
  value: string | number
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

export default function AdminDashboard() {
  const { currentSite } = useTenant()
  const [metrics, setMetrics] = useState<DynamicMetric[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentSite?.id && currentSite.features) {
      getDynamicMetrics()
    }
  }, [currentSite?.id, currentSite?.features])

  const getDynamicMetrics = async () => {
    if (!currentSite?.id || !currentSite.features) return

    try {
      setLoading(true)
      
      // Get the first 4 features after DASHBOARD
      const availableFeatures = currentSite.features
        .filter(feature => feature !== SiteFeature.DASHBOARD)
        .slice(0, 4)

      const metricsPromises = availableFeatures.map(feature => getMetricForFeature(feature, currentSite.id))
      const metricsResults = await Promise.all(metricsPromises)
      
      setMetrics(metricsResults.filter(Boolean) as DynamicMetric[])
    } catch (error) {
      console.error('Error fetching dynamic metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMetricForFeature = async (feature: SiteFeature, siteId: string): Promise<DynamicMetric | null> => {
    try {
      switch (feature) {
        case SiteFeature.PRODUCTS: {
          const stats = await getProductsStats(siteId)
          return {
            feature,
            title: 'Total Products',
            value: stats.totalProducts,
            description: `${stats.activeProducts} active, ${stats.lowStockProducts} low stock`,
            icon: Package,
            color: 'text-blue-600'
          }
        }

        case SiteFeature.CATEGORIES: {
          const categories = await getCategories(siteId)
          const totalProducts = categories.reduce((sum, cat) => sum + cat.products.length, 0)
          return {
            feature,
            title: 'Categories',
            value: categories.length,
            description: `${totalProducts} total products`,
            icon: Tags,
            color: 'text-green-600'
          }
        }

        case SiteFeature.EVENTS: {
          const events = await getEvents(siteId)
          const upcomingEvents = events.filter(event => 
            event.isActive && new Date(event.startDate) >= new Date()
          )
          return {
            feature,
            title: 'Events',
            value: events.filter(e => e.isActive).length,
            description: `${upcomingEvents.length} upcoming events`,
            icon: Calendar,
            color: 'text-purple-600'
          }
        }

        case SiteFeature.EVENT_SERVICES: {
          const statsResult = await getEventServicesStats(siteId)
          if (statsResult.success && statsResult.data) {
            const { totalServices, activeServices, featuredServices } = statsResult.data
            return {
              feature,
              title: 'Event Services',
              value: totalServices,
              description: `${activeServices} active, ${featuredServices} featured`,
              icon: Sparkles,
              color: 'text-yellow-600'
            }
          }
          return null
        }

        case SiteFeature.ABOUT: {
          const about = await getAbout(siteId)
          return {
            feature,
            title: 'About Us',
            value: about ? 'Configured' : 'Not Set',
            description: about ? 'Business information complete' : 'Setup required',
            icon: about ? CheckCircle : XCircle,
            color: about ? 'text-green-600' : 'text-gray-400'
          }
        }

        case SiteFeature.CONTACT: {
          const contact = await getContact(siteId)
          return {
            feature,
            title: 'Contact Info',
            value: contact ? 'Configured' : 'Not Set',
            description: contact ? 'Contact information complete' : 'Setup required',
            icon: contact ? CheckCircle : XCircle,
            color: contact ? 'text-green-600' : 'text-gray-400'
          }
        }

        default:
          return null
      }
    } catch (error) {
      console.error(`Error fetching metric for ${feature}:`, error)
      return null
    }
  }

  // Show message if no site is selected
  if (!currentSite) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Site Selected
          </h3>
          <p className="text-gray-600">
            Please select a site to view the dashboard.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Overview of {currentSite.name} • {currentSite.packageType} Package
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-700">
            {currentSite.features.length} Features Available
          </p>
          <p className="text-xs text-gray-500">
            Package: {currentSite.packageType}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      ) : (
        <>
          {/* Dynamic Feature Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map(({ feature, title, value, description, icon: Icon, color }) => (
              <Card key={feature}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{title}</CardTitle>
                  <Icon className={`h-4 w-4 ${color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{value}</div>
                  <p className="text-xs text-muted-foreground">
                    {description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Metrics for Sites with Many Features */}
          {currentSite.features.length > 4 && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Additional Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-lg font-semibold">
                      {currentSite.features.length - 4} More Features
                    </div>
                    <p className="text-sm text-gray-600">
                      Your {currentSite.packageType} package includes additional features beyond the main dashboard metrics.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {currentSite.features
                        .filter(feature => feature !== SiteFeature.DASHBOARD)
                        .slice(4)
                        .map(feature => (
                          <span
                            key={feature}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                          >
                            {feature.toLowerCase().replace('_', ' ')}
                          </span>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Package Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-lg font-semibold text-blue-600">
                        {currentSite.packageType} Package
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Complete business management solution with {currentSite.features.length} features.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm">Getting Started</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Navigate using the sidebar menu</li>
                        <li>• Configure your business information</li>
                        <li>• Add your products and categories</li>
                        <li>• Set up events and services</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Welcome Section for Basic Packages */}
          {currentSite.features.length <= 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Welcome to {currentSite.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Manage your business with the {currentSite.packageType} package features. 
                    Your current package includes {currentSite.features.length} powerful features.
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <h3 className="font-semibold">Available Features</h3>
                      <div className="flex flex-wrap gap-2">
                        {currentSite.features
                          .filter(feature => feature !== SiteFeature.DASHBOARD)
                          .map(feature => (
                            <span
                              key={feature}
                              className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
                            >
                              {feature.toLowerCase().replace('_', ' ')}
                            </span>
                          ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold">Getting Started</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Use the sidebar to navigate features</li>
                        <li>• Start by setting up your categories</li>
                        <li>• Add your first products</li>
                        <li>• Monitor your dashboard regularly</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
} 