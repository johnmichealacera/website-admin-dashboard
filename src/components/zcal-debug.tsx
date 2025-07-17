'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Database, RefreshCw } from 'lucide-react'
import { SiteFeature } from '@/lib/types'
import { getSiteFeature, updateSiteFeatureZcal } from '@/lib/actions/site-features'

interface ZcalDebugProps {
  siteId: string
}

export function ZcalDebug({ siteId }: ZcalDebugProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [debugData, setDebugData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const loadDebugData = async () => {
    setLoading(true)
    try {
      const response = await getSiteFeature(siteId, SiteFeature.EVENT_SERVICES)
      setDebugData({
        success: response.success,
        data: response.data,
        error: response.error,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      setDebugData({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  const testSave = async () => {
    setLoading(true)
    try {
      const response = await updateSiteFeatureZcal(
        siteId,
        SiteFeature.EVENT_SERVICES,
        'https://zcal.co/test-debug',
        true
      )
      setDebugData({
        saveSuccess: response.success,
        saveData: response.data,
        saveError: response.error,
        timestamp: new Date().toISOString()
      })
      
      // Reload data after save
      setTimeout(loadDebugData, 1000)
    } catch (error) {
      setDebugData({
        saveSuccess: false,
        saveError: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDebugData()
  }, [siteId])

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-orange-800">
          <Database className="h-5 w-5" />
          <span>Zcal Debug Info</span>
          <Badge variant="outline" className="text-orange-600 border-orange-600">
            Debug
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDebugData}
            disabled={loading}
            className="flex items-center space-x-1"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={testSave}
            disabled={loading}
            className="text-blue-600 border-blue-600"
          >
            Test Save
          </Button>
        </div>

        {debugData && (
          <div className="space-y-2">
            <div className="text-sm">
              <strong>Site ID:</strong> {siteId}
            </div>
            <div className="text-sm">
              <strong>Feature:</strong> {SiteFeature.EVENT_SERVICES}
            </div>
            <div className="text-sm">
              <strong>Timestamp:</strong> {debugData.timestamp}
            </div>
            
            {debugData.success !== undefined && (
              <div className="text-sm">
                <strong>Load Success:</strong> 
                <Badge variant={debugData.success ? 'default' : 'destructive'} className="ml-2">
                  {debugData.success ? 'Yes' : 'No'}
                </Badge>
              </div>
            )}
            
            {debugData.data && (
              <div className="text-sm space-y-1">
                <div><strong>Zcal Enabled:</strong> {debugData.data.zcalEnabled ? 'Yes' : 'No'}</div>
                <div><strong>Zcal Link:</strong> {debugData.data.zcalLink || 'Not set'}</div>
                <div><strong>Description:</strong> {debugData.data.description || 'Not set'}</div>
              </div>
            )}
            
            {debugData.error && (
              <div className="text-sm text-red-600">
                <strong>Error:</strong> {debugData.error}
              </div>
            )}
            
            {debugData.saveSuccess !== undefined && (
              <div className="text-sm">
                <strong>Save Success:</strong> 
                <Badge variant={debugData.saveSuccess ? 'default' : 'destructive'} className="ml-2">
                  {debugData.saveSuccess ? 'Yes' : 'No'}
                </Badge>
              </div>
            )}
            
            {debugData.saveError && (
              <div className="text-sm text-red-600">
                <strong>Save Error:</strong> {debugData.saveError}
              </div>
            )}
          </div>
        )}

        <details className="text-xs">
          <summary className="cursor-pointer text-gray-600">Raw Debug Data</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify(debugData, null, 2)}
          </pre>
        </details>
      </CardContent>
    </Card>
  )
} 