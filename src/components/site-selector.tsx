'use client'

import { useState } from 'react'
import { ChevronDown, Building2, Check } from 'lucide-react'
import { useTenant } from '@/contexts/tenant-context'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function SiteSelector() {
  const { currentSite, userSites, switchSite } = useTenant()
  const [isOpen, setIsOpen] = useState(false)

  if (!currentSite || userSites.length <= 1) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2">
        <Building2 className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-900">
          {currentSite?.name || 'No Site Selected'}
        </span>
      </div>
    )
  }

  const handleSiteChange = (siteId: string) => {
    switchSite(siteId)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-left"
      >
        <Building2 className="h-4 w-4 text-gray-500" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-gray-900 truncate">
            {currentSite.name}
          </span>
          <p className="text-xs text-gray-500 truncate">
            {currentSite.domain}
          </p>
        </div>
        <ChevronDown 
          className={cn(
            "h-4 w-4 text-gray-500 transition-transform",
            isOpen && "transform rotate-180"
          )} 
        />
      </Button>

      {isOpen && (
        <>
          {/* Overlay to close dropdown when clicking outside */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown menu */}
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[250px]">
            <div className="py-1">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Switch Site
                </p>
              </div>
              
              {userSites.map((userSite) => (
                <button
                  key={userSite.siteId}
                  onClick={() => handleSiteChange(userSite.siteId)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors",
                    currentSite.id === userSite.siteId && "bg-blue-50"
                  )}
                >
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {userSite.site?.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {userSite.site?.domain}
                    </p>
                    <p className="text-xs text-blue-600 capitalize">
                      {userSite.role.toLowerCase()}
                    </p>
                  </div>
                  {currentSite.id === userSite.siteId && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
} 