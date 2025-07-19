'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Settings, Save, Loader2, AlertCircle, CheckCircle, Edit3, ArrowUpDown, GripVertical } from 'lucide-react'
import { useTenant } from '@/contexts/tenant-context'
import { SiteFeature, ClientSiteSettingsData, SitePackage, FeatureName } from '@/lib/types'
import { updateClientSiteSettings, getClientSiteSettings } from '@/lib/actions/site-settings'
import { ColorPicker } from '@/components/ui/color-picker'

// Available features that clients can choose from (excluding DASHBOARD which is always included)
const AVAILABLE_FEATURES = [
  { feature: SiteFeature.PRODUCTS, label: 'Products', description: 'Manage product inventory and catalog' },
  { feature: SiteFeature.CATEGORIES, label: 'Categories', description: 'Organize products into categories' },
  { feature: SiteFeature.EVENTS, label: 'Bookings', description: 'Create and manage bookings' },
  { feature: SiteFeature.EVENT_SERVICES, label: 'Event Services', description: 'Manage service packages and pricing' },
  { feature: SiteFeature.ABOUT, label: 'About Us', description: 'Manage company information' },
  { feature: SiteFeature.CONTACT, label: 'Contact Info', description: 'Manage contact details and social links' },
]

// Package-based feature limits (excluding DASHBOARD which is always included)
const PACKAGE_FEATURE_LIMITS = {
  [SitePackage.BASIC]: { min: 1, max: 3 },
  [SitePackage.STANDARD]: { min: 4, max: 6 },
  [SitePackage.PREMIUM]: { min: 4, max: 6 },
  [SitePackage.ENTERPRISE]: { min: 1, max: 6 } // No real limit for enterprise
}

export default function ClientSiteSettingsPage() {
  const { currentSite } = useTenant()
  const [siteSettings, setSiteSettings] = useState<ClientSiteSettingsData | null>(null)
  const [sitePackage, setSitePackage] = useState<SitePackage>(SitePackage.BASIC)
  // Update formData and siteSettings to use array of { name, description } objects
  const [formData, setFormData] = useState<ClientSiteSettingsData>({
    name: '',
    description: '',
    features: [{ siteId: currentSite?.id || '', name: SiteFeature.DASHBOARD, description: '' }],
    featuresOrder: [SiteFeature.DASHBOARD],
    colorPalette: ['#3B82F6', '#10B981', '#F59E0B']
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (currentSite?.id) {
      loadSiteSettings()
    }
  }, [currentSite?.id])

  const loadSiteSettings = async () => {
    if (!currentSite?.id) return
    
    setLoading(true)
    setError(null)
    
    const result = await getClientSiteSettings(currentSite.id)
    if (result.success && result.site) {
      const settings: ClientSiteSettingsData = {
        name: result.site.name,
        description: result.site.description,
        features: result.site.features || [{ siteId: currentSite?.id || '', name: SiteFeature.DASHBOARD, description: '' }],
        featuresOrder: result.site.featuresOrder as FeatureName[],
        colorPalette: result.site.colorPalette || ['#3B82F6', '#10B981', '#F59E0B']
      }
      setSiteSettings(settings)
      setFormData(settings)
      setSitePackage(result.site.packageType as SitePackage)
    } else {
      setError(result.error || 'Failed to load site settings')
    }
    setLoading(false)
  }

  const handleFeatureToggle = (feature: SiteFeature) => {
    if (feature === SiteFeature.DASHBOARD) return // Dashboard can't be toggled
    const isSelected = formData.features.some(f => f.name === feature)
    if (isSelected) {
      // Remove feature
      const newFeatures = formData.features.filter(f => f.name !== feature)
      const newOrder = formData.featuresOrder.filter(f => f !== feature)
      setFormData(prev => ({
        ...prev,
        features: newFeatures,
        featuresOrder: newOrder
      }))
    } else {
      if (canAddMore) {
        const newFeatures = [...formData.features, { siteId: currentSite?.id || '', name: feature, description: '' }]
        const newOrder = [...formData.featuresOrder, feature]
        setFormData(prev => ({
          ...prev,
          features: newFeatures,
          featuresOrder: newOrder
        }))
      }
    }
  }

  const moveFeatureUp = (index: number) => {
    if (index <= 1) return // Can't move above Dashboard (index 0)
    
    const newOrder = [...formData.featuresOrder]
    const temp = newOrder[index]
    newOrder[index] = newOrder[index - 1]
    newOrder[index - 1] = temp
    
    setFormData(prev => ({ ...prev, featuresOrder: newOrder }))
  }

  const moveFeatureDown = (index: number) => {
    if (index >= formData.featuresOrder.length - 1 || index === 0) return // Can't move Dashboard down
    
    const newOrder = [...formData.featuresOrder]
    const temp = newOrder[index]
    newOrder[index] = newOrder[index + 1]
    newOrder[index + 1] = temp
    
    setFormData(prev => ({ ...prev, featuresOrder: newOrder }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentSite?.id) return

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    const result = await updateClientSiteSettings({
      siteId: currentSite.id,
      name: formData.name,
      description: formData.description,
      features: formData.features,
      featuresOrder: formData.featuresOrder,
      colorPalette: formData.colorPalette
    })

    if (result.success) {
      setSuccess('Site settings updated successfully!')
      setSiteSettings(formData)
      // The navigation will update automatically due to revalidatePath in the action
      setTimeout(() => setSuccess(null), 3000)
    } else {
      setError(result.error || 'Failed to update site settings')
    }

    setIsSubmitting(false)
  }

  const nonDashboardFeatures = formData.features.filter(f => f.name !== SiteFeature.DASHBOARD)
  const packageLimits = PACKAGE_FEATURE_LIMITS[sitePackage]
  const currentFeatureCount = nonDashboardFeatures.length
  const canAddMore = currentFeatureCount < packageLimits.max
  const hasMinimumFeatures = currentFeatureCount >= packageLimits.min
  const remainingSlots = packageLimits.max - currentFeatureCount

  // Check if there are any changes from the original settings
  const hasChanges = siteSettings && (
    formData.name !== siteSettings.name ||
    formData.description !== siteSettings.description ||
    JSON.stringify(formData.features.map(f => f.name).sort()) !== JSON.stringify(siteSettings.features.map(f => f.name).sort()) ||
    JSON.stringify(formData.featuresOrder) !== JSON.stringify(siteSettings.featuresOrder) ||
    JSON.stringify(formData.colorPalette) !== JSON.stringify(siteSettings.colorPalette)
  )

  // Debug logging (remove in production)
  console.log('Site Settings Debug:', {
    hasChanges,
    nameChanged: siteSettings ? formData.name !== siteSettings.name : false,
    featuresChanged: siteSettings ? JSON.stringify(formData.features.map(f => f.name).sort()) !== JSON.stringify(siteSettings.features.map(f => f.name).sort()) : false,
    orderChanged: siteSettings ? JSON.stringify(formData.featuresOrder) !== JSON.stringify(siteSettings.featuresOrder) : false,
    colorsChanged: siteSettings ? JSON.stringify(formData.colorPalette) !== JSON.stringify(siteSettings.colorPalette) : false,
    remainingSlots,
    canSave: !isSubmitting && formData.name.trim() !== '' && hasMinimumFeatures && hasChanges
  })

  // Button should be enabled when:
  // 1. Not currently submitting
  // 2. Site name is not empty
  // 3. Features are within package limits (min and max)
  // 4. There are actual changes to save
  const canSave = !isSubmitting && 
                  formData.name.trim() !== '' && 
                  hasMinimumFeatures && 
                  hasChanges

  // Show message if no site is selected
  if (!currentSite) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Settings className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Site Selected
          </h3>
          <p className="text-gray-600">
            Please select a site to manage its settings.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading site settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
          <p className="text-sm text-gray-500">
            Manage your site name and features
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-500">{currentSite.name}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-green-700">{success}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Site Name Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Edit3 className="h-5 w-5" />
              <span>Site Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your site name"
                className="mt-1"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                This is the name that appears in your dashboard and navigation.
              </p>
            </div>

            <div>
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value || null }))}
                placeholder="Enter a brief description of your site (optional)"
                className="mt-1"
                rows={3}
              />
              <p className="text-sm text-gray-500 mt-1">
                A brief description that will be stored in your site settings.
              </p>
            </div>

            {/* Color Palette Section */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-5 h-5 rounded bg-gradient-to-r from-blue-500 via-green-500 to-amber-500"></div>
                <Label className="text-base font-medium">Color Palette</Label>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Choose 3 colors that represent your brand. These will be used throughout your website.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ColorPicker
                  value={formData.colorPalette[0]}
                  onChange={(color) => {
                    const newPalette = [...formData.colorPalette]
                    newPalette[0] = color
                    setFormData(prev => ({ ...prev, colorPalette: newPalette }))
                  }}
                  label="Primary Color"
                />
                <ColorPicker
                  value={formData.colorPalette[1]}
                  onChange={(color) => {
                    const newPalette = [...formData.colorPalette]
                    newPalette[1] = color
                    setFormData(prev => ({ ...prev, colorPalette: newPalette }))
                  }}
                  label="Secondary Color"
                />
                <ColorPicker
                  value={formData.colorPalette[2]}
                  onChange={(color) => {
                    const newPalette = [...formData.colorPalette]
                    newPalette[2] = color
                    setFormData(prev => ({ ...prev, colorPalette: newPalette }))
                  }}
                  label="Accent Color"
                />
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                <div className="flex items-center space-x-3">
                  {formData.colorPalette.map((color, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div
                        className="w-6 h-6 rounded-full border border-gray-300"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs font-mono text-gray-600">{color}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Selection Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Feature Selection</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{sitePackage}</Badge>
                <Badge variant={hasMinimumFeatures ? "default" : "secondary"}>
                  {currentFeatureCount}/{packageLimits.max} features selected
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Choose {packageLimits.min === packageLimits.max ? packageLimits.min : `${packageLimits.min}-${packageLimits.max}`} features for your {sitePackage.toLowerCase()} package. Dashboard is always included.
            </p>
            
            <div className="grid gap-3">
              {/* Dashboard - Always Selected */}
              <div className="flex items-center justify-between p-3 border border-blue-200 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled={true}
                    className="rounded border-gray-300"
                  />
                  <div>
                    <div className="font-medium text-blue-900">Dashboard</div>
                    <div className="text-sm text-blue-700">Main dashboard with analytics</div>
                  </div>
                </div>
                <Badge variant="default">Required</Badge>
              </div>

              {/* Available Features */}
              {AVAILABLE_FEATURES.map((item) => {
                const isSelected = formData.features.some(f => f.name === item.feature)
                const canSelect = !isSelected && canAddMore
                
                return (
                  <div 
                    key={item.feature}
                    className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                      isSelected 
                        ? 'border-green-200 bg-green-50' 
                        : canSelect 
                          ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer'
                          : 'border-gray-100 bg-gray-50 opacity-50'
                    }`}
                    onClick={() => canSelect || isSelected ? handleFeatureToggle(item.feature) : undefined}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleFeatureToggle(item.feature)}
                        disabled={!canSelect && !isSelected}
                        className="rounded border-gray-300"
                      />
                      <div>
                        <div className={`font-medium ${isSelected ? 'text-green-900' : 'text-gray-900'}`}>
                          {item.label}
                        </div>
                        <div className={`text-sm ${isSelected ? 'text-green-700' : 'text-gray-600'}`}>
                          {item.description}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Badge variant="default">Selected</Badge>}
                  </div>
                )
              })}
            </div>

            {!hasMinimumFeatures && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                You need to select at least {packageLimits.min} feature{packageLimits.min !== 1 ? 's' : ''} for your {sitePackage.toLowerCase()} package.
              </p>
            )}
            {hasMinimumFeatures && remainingSlots > 0 && (
              <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                You can select {remainingSlots} more feature{remainingSlots !== 1 ? 's' : ''}.
              </p>
            )}
            {hasMinimumFeatures && remainingSlots === 0 && (
              <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                You have reached the maximum number of features for your {sitePackage.toLowerCase()} package.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Navigation Order Section */}
        {formData.featuresOrder.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ArrowUpDown className="h-5 w-5" />
                <span>Navigation Order</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Arrange the order of features in your navigation menu. Dashboard will always be first.
              </p>
              
              <div className="space-y-2">
                {formData.featuresOrder.map((feature, index) => {
                  const featureInfo = AVAILABLE_FEATURES.find(f => f.feature === feature) || 
                    { feature: SiteFeature.DASHBOARD, label: 'Dashboard', description: 'Main dashboard with analytics' }
                  
                  return (
                    <div 
                      key={feature}
                      className={`flex items-center justify-between p-3 border rounded-lg ${
                        feature === SiteFeature.DASHBOARD ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <GripVertical className={`h-4 w-4 ${feature === SiteFeature.DASHBOARD ? 'text-blue-400' : 'text-gray-400'}`} />
                        <div className="text-sm font-medium text-gray-700">
                          {index + 1}. {featureInfo.label}
                        </div>
                      </div>
                      
                      {feature !== SiteFeature.DASHBOARD && (
                        <div className="flex items-center space-x-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveFeatureUp(index)}
                            disabled={index <= 1}
                            className="h-8 w-8 p-0"
                          >
                            ↑
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveFeatureDown(index)}
                            disabled={index >= formData.featuresOrder.length - 1}
                            className="h-8 w-8 p-0"
                          >
                            ↓
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-500">
            {!hasChanges && hasMinimumFeatures && formData.name.trim() !== '' ? (
              <span>No changes to save</span>
            ) : !hasMinimumFeatures ? (
              <span>Please select at least {packageLimits.min} feature{packageLimits.min !== 1 ? 's' : ''}</span>
            ) : !formData.name.trim() ? (
              <span>Site name is required</span>
            ) : (
              <span>Changes will take effect immediately</span>
            )}
          </div>
          <Button 
            type="submit" 
            disabled={!canSave}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
} 