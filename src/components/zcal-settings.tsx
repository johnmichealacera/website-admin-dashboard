'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Calendar, ExternalLink, Settings } from 'lucide-react'
import { SiteFeature, SiteFeatureData } from '@/lib/types'
import { getSiteFeature, updateSiteFeatureZcal } from '@/lib/actions/site-features'

interface ZcalSettingsProps {
  siteId: string
}

export function ZcalSettings({ siteId }: ZcalSettingsProps) {
  const [zcalSettings, setZcalSettings] = useState<SiteFeatureData | null>(null)
  const [zcalLink, setZcalLink] = useState('')
  const [zcalEnabled, setZcalEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadZcalSettings()
  }, [siteId])

  const loadZcalSettings = async () => {
    setLoading(true)
    try {
      const response = await getSiteFeature(siteId, SiteFeature.EVENT_SERVICES)
      if (response.success && response.data) {
        setZcalSettings(response.data)
        setZcalLink(response.data.zcalLink || '')
        setZcalEnabled(response.data.zcalEnabled || false)
      }
    } catch (error) {
      console.error('Error loading Zcal settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await updateSiteFeatureZcal(
        siteId,
        SiteFeature.EVENT_SERVICES,
        zcalLink || null,
        zcalEnabled
      )
      
      if (response.success) {
        setZcalSettings(response.data!)
        alert('Zcal settings saved successfully!')
      } else {
        alert(response.error || 'Failed to save Zcal settings')
      }
    } catch (error) {
      console.error('Error saving Zcal settings:', error)
      alert('Failed to save Zcal settings')
    } finally {
      setSaving(false)
    }
  }

  const handleTestLink = () => {
    if (zcalLink) {
      window.open(zcalLink, '_blank')
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Zcal Booking Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Zcal Booking Settings</span>
          {zcalEnabled && (
            <Badge variant="outline" className="text-green-600 border-green-600">
              Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="zcal-enabled"
              checked={zcalEnabled}
              onCheckedChange={setZcalEnabled}
            />
            <Label htmlFor="zcal-enabled" className="text-sm font-medium">
              Enable Zcal Booking Integration
            </Label>
          </div>
          
          {zcalEnabled && (
            <div className="space-y-4 pl-6 border-l-2 border-gray-200">
              <div className="space-y-2">
                <Label htmlFor="zcal-link" className="text-sm font-medium">
                  Zcal Booking Link
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id="zcal-link"
                    type="url"
                    placeholder="https://zcal.co/your-booking-link"
                    value={zcalLink}
                    onChange={(e) => setZcalLink(e.target.value)}
                    className="flex-1"
                  />
                  {zcalLink && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTestLink}
                      className="flex items-center space-x-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Test</span>
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Enter your Zcal booking link. This will be used for event service bookings.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={loadZcalSettings}
            disabled={saving}
          >
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </Button>
        </div>

        {zcalSettings && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Current Status:</strong> {zcalEnabled ? 'Enabled' : 'Disabled'}
              {zcalEnabled && zcalLink && (
                <span className="block mt-1">
                  <strong>Booking Link:</strong> {zcalLink}
                </span>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 