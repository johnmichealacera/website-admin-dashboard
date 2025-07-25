'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@auth0/nextjs-auth0'
import { useTenant } from '@/contexts/tenant-context'
import { SiteFeature } from '@/lib/types'
import { isFeatureAvailable } from '@/lib/utils/site-features'
import { Logo } from '@/components/logo'
import { 
  Package, 
  Tags, 
  FileText, 
  Phone, 
  Home, 
  Menu, 
  X,
  Calendar,
  Sparkles,
  LogOut,
  User,
  Settings,
  Image
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteSelector } from '@/components/site-selector'
import { cn } from '@/lib/utils'

interface AdminLayoutProps {
  children: ReactNode
}

interface NavItem {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  feature: SiteFeature | null
  superAdminOnly?: boolean
  regularAdminAccess?: boolean
}

const navItems: NavItem[] = [
  { href: '/admin', icon: Home, label: 'Dashboard', feature: SiteFeature.DASHBOARD },
  { href: '/admin/hero', icon: Image, label: 'Hero Section', feature: SiteFeature.HERO },
  { href: '/admin/products', icon: Package, label: 'Products', feature: SiteFeature.PRODUCTS },
  { href: '/admin/categories', icon: Tags, label: 'Categories', feature: SiteFeature.CATEGORIES },
  { href: '/admin/events', icon: Calendar, label: 'Bookings', feature: SiteFeature.EVENTS },
  { href: '/admin/event-services', icon: Sparkles, label: 'Event Services', feature: SiteFeature.EVENT_SERVICES },
  { href: '/admin/about', icon: FileText, label: 'About Us', feature: SiteFeature.ABOUT },
  { href: '/admin/contact', icon: Phone, label: 'Contact Info', feature: SiteFeature.CONTACT },
  { href: '/admin/site-settings', icon: Settings, label: 'Site Settings', feature: null, regularAdminAccess: true },
  { href: '/admin/settings', icon: Settings, label: 'Admin Settings', feature: null, superAdminOnly: true },
]

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { user, error, isLoading } = useUser()
  const { currentSite, userSites, currentUser } = useTenant()

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  // If Auth0 is not loading but user is still undefined, redirect to login
  if (!isLoading && !user) {
    window.location.href = '/api/auth/login'
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Redirecting to login...</span>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Authentication Error</p>
          <Link href="/login">
            <Button>Return to Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Access Denied</p>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Show no site access message
  if (userSites.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-4 opacity-60">
            <Logo size="lg" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Site Access</h2>
          <p className="text-gray-600 mb-4">
            You don&apos;t have access to any sites yet. Please contact your administrator to get access.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Logged in as: {user.email}</p>
            <a href="/auth/logout">
              <Button variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Filter navigation items based on site features and user permissions
  const availableNavItems = navItems.filter(item => {
    // Always show dashboard
    if (item.feature === SiteFeature.DASHBOARD) {
      return true
    }
    
    // Check super admin only items
    if (item.superAdminOnly) {
      return currentUser?.role === 'SUPER_ADMIN'
    }
    
    // Check regular admin access items (like site settings)
    if (item.regularAdminAccess) {
      return currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN'
    }
    
    // Check if feature is available for current site
    if (item.feature && currentSite?.features) {
      return isFeatureAvailable(currentSite.features.map(feature => feature.name), item.feature)
    }
    
    return false
  })

  // Sort navigation items based on site's custom featuresOrder
  const sortedNavItems = [...availableNavItems].sort((a, b) => {
    if (!currentSite?.featuresOrder) {
      return 0 // Keep original order if no custom order is set
    }
    
    const aIndex = a.feature ? currentSite.featuresOrder.indexOf(a.feature) : -1
    const bIndex = b.feature ? currentSite.featuresOrder.indexOf(b.feature) : -1
    
    // If feature is not in custom order, put it at the end
    if (aIndex === -1 && bIndex === -1) return 0
    if (aIndex === -1) return 1
    if (bIndex === -1) return -1
    
    return aIndex - bIndex
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 border-b bg-white">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Logo size="md" />
            <div className="flex flex-col min-w-0">
              <span className="text-base sm:text-lg md:text-xl font-bold text-gray-900 leading-tight truncate">
                Admin Panel
              </span>
              <span className="text-xs text-gray-500 hidden sm:block font-medium truncate">
                Local Web Ventures
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Site Selector */}
        <div className="border-b border-gray-200 p-4">
          <SiteSelector />
        </div>

        <nav className="mt-4">
          <div className="space-y-1 px-3">
            {sortedNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {item.superAdminOnly && (
                    <span className="ml-auto text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Super Admin
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* User info and logout */}
        <div className="absolute bottom-0 w-full p-4 border-t">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name || user.email}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.email}
              </p>
              {currentUser?.role === 'SUPER_ADMIN' && (
                <p className="text-xs text-yellow-600 font-medium">
                  Super Admin
                </p>
              )}
            </div>
          </div>
          <a href="/auth/logout">
            <Button variant="outline" size="sm" className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </a>
        </div>
      </div>

      {/* Main content */}
      <div className="md:ml-64">
        {/* Top header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Managing: <span className="font-medium text-gray-900">{currentSite?.name || 'No Site Selected'}</span>
              </span>
              {currentSite?.packageType && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {currentSite.packageType}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {currentSite ? children : (
            <div className="text-center py-12">
              <p className="text-gray-500">Please select a site to continue</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
} 