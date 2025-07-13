'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Tags, PhilippinePeso, AlertTriangle, Calendar } from 'lucide-react'
import { useTenant } from '@/contexts/tenant-context'
import { getProductsStats } from '@/lib/actions/products'
import { getCategories } from '@/lib/actions/categories'
import { getEvents } from '@/lib/actions/events'
import { useState, useEffect } from 'react'

interface DashboardStats {
  totalProducts: number
  totalCategories: number
  lowStockItems: number
  totalValue: number
  totalEvents: number
  upcomingEvents: number
}

export default function AdminDashboard() {
  const { currentSite } = useTenant()
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    lowStockItems: 0,
    totalValue: 0,
    totalEvents: 0,
    upcomingEvents: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentSite?.id) {
      getDashboardStats()
    }
  }, [currentSite?.id])

  const getDashboardStats = async () => {
    if (!currentSite?.id) return

    try {
      setLoading(true)
      const [productStats, categories, events] = await Promise.all([
        getProductsStats(currentSite.id),
        getCategories(currentSite.id),
        getEvents(currentSite.id)
      ])

      const upcomingEvents = events.filter(event => 
        event.isActive && new Date(event.startDate) >= new Date()
      )

      setStats({
        totalProducts: productStats.totalProducts,
        totalCategories: categories.length,
        lowStockItems: productStats.lowStockProducts,
        totalValue: productStats.totalInventoryValue,
        totalEvents: events.filter(event => event.isActive).length,
        upcomingEvents: upcomingEvents.length
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Overview of {currentSite.name}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  Active products in inventory
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                <Tags className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCategories}</div>
                <p className="text-xs text-muted-foreground">
                  Product categories
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEvents}</div>
                <p className="text-xs text-muted-foreground">
                  Active events
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
                <PhilippinePeso className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₱{stats.totalValue.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total inventory value
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {stats.lowStockItems}
                </div>
                <p className="text-xs text-muted-foreground">
                  Items with stock &lt; 5
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {stats.upcomingEvents}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Events scheduled for the future
                </p>
                {stats.upcomingEvents > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Check the Events section to manage upcoming events
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Welcome to {currentSite.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Manage your business inventory, categories, events, and business information from this dashboard.
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <h3 className="font-semibold">Quick Actions</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Add new products to your inventory</li>
                        <li>• Create and manage product categories</li>
                        <li>• Schedule and manage events</li>
                        <li>• Update your business information</li>
                        <li>• Manage contact details</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold">Getting Started</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Navigate using the sidebar menu</li>
                        <li>• Check the Products section to manage inventory</li>
                        <li>• Review upcoming events regularly</li>
                        <li>• Review low stock items regularly</li>
                        <li>• Keep your business info up to date</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
} 