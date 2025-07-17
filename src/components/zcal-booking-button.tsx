'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar, ExternalLink } from 'lucide-react'
import { SiteFeature } from '@/lib/types'
import { getSiteFeature } from '@/lib/actions/site-features'

interface ZcalBookingButtonProps {
  siteId: string
  serviceName: string
  className?: string
}

export function ZcalBookingButton({ siteId, serviceName, className }: ZcalBookingButtonProps) {
  const [zcalLink, setZcalLink] = useState<string | null>(null)
  const [zcalEnabled, setZcalEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadZcalSettings()
  }, [siteId])

  const loadZcalSettings = async () => {
    setLoading(true)
    try {
      const response = await getSiteFeature(siteId, SiteFeature.EVENT_SERVICES)
      if (response.success && response.data) {
        setZcalLink(response.data.zcalLink || null)
        setZcalEnabled(response.data.zcalEnabled || false)
      }
    } catch (error) {
      console.error('Error loading Zcal settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = () => {
    if (zcalLink) {
      // You can customize the URL with service-specific parameters
      const bookingUrl = new URL(zcalLink)
      bookingUrl.searchParams.set('service', serviceName)
      window.open(bookingUrl.toString(), '_blank')
    }
  }

  if (loading) {
    return (
      <Button variant="outline" size="sm" disabled className={className}>
        <Calendar className="h-4 w-4 mr-2" />
        Loading...
      </Button>
    )
  }

  if (!zcalEnabled || !zcalLink) {
    return null
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleBooking}
      className={`text-blue-600 border-blue-600 hover:bg-blue-50 ${className}`}
    >
      <Calendar className="h-4 w-4 mr-2" />
      Book Now
      <ExternalLink className="h-3 w-3 ml-1" />
    </Button>
  )
} 