'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Settings, Package, Shield, Building2, AlertCircle, Save, Loader2, Upload, X } from 'lucide-react'
import { useTenant } from '@/contexts/tenant-context'
import { SitePackage, SiteFeature, SitePackageFormData, SitePackageInfo, SiteFeatureData } from '@/lib/types'
import { updateSitePackage, getSitePackageInfo, getAllSitesPackageInfo, updateSiteLogo } from '@/lib/actions/site-settings'
import { PACKAGE_FEATURES } from '@/lib/utils/site-features'
import { handleFileChange } from "@jmacera/cloudinary-image-upload";
import Image from 'next/image'

export default function SiteSettingsPage() {
  const { currentUser, currentSite } = useTenant()
  const [allSites, setAllSites] = useState<SitePackageInfo[]>([])
  const [selectedSite, setSelectedSite] = useState<SitePackageInfo | null>(null)
  const [formData, setFormData] = useState<SitePackageFormData>({
    packageType: SitePackage.BASIC,
    features: [{ siteId: currentSite?.id || '', name: SiteFeature.DASHBOARD, description: '' }]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cloudinary configuration
  const cloudinaryUrl = process.env.NEXT_PUBLIC_CLOUDINARY_URL
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY

  useEffect(() => {
    loadAllSites()
  }, [])

  useEffect(() => {
    if (currentSite && !selectedSite) {
      loadSitePackageInfo(currentSite.id)
    }
  }, [currentSite, selectedSite])

  const loadAllSites = async () => {
    setLoading(true)
    const result = await getAllSitesPackageInfo()
    if (result.success) {
      setAllSites(result.sites as SitePackageInfo[])
    } else {
      setError(result.error || 'Failed to load sites')
    }
    setLoading(false)
  }

  const loadSitePackageInfo = async (siteId: string) => {
    const result = await getSitePackageInfo(siteId)
    if (result.success) {
      const site: SitePackageInfo | undefined = result.site
      setSelectedSite(site || null)
      setFormData({
        packageType: site?.packageType as SitePackage,
        features: site?.features || [],
      })
    } else {
      setError(result.error || 'Failed to load site package info')
    }
  }

  const handleSiteSelect = (siteId: string) => {
    const site = allSites.find(s => s.id === siteId)
    if (site) {
      setSelectedSite(site)
      setFormData({
        packageType: site.packageType as SitePackage,
        features: site.features as SiteFeatureData[]
      })
    }
  }

  const handlePackageChange = (packageType: SitePackage) => {
    const availableFeatures = PACKAGE_FEATURES[packageType]
    setFormData({
      packageType,
      features: availableFeatures.map(feature => ({
        siteId: selectedSite?.id || '',
        name: feature,
        description: ''
      }))
    })
  }

  const handleFeatureToggle = (feature: SiteFeature) => {
    const availableFeatures = PACKAGE_FEATURES[formData.packageType]
    if (!availableFeatures.includes(feature)) return

    setFormData(prev => ({
      ...prev,
      features: prev.features.some(f => f.name === feature)
        ? prev.features.filter(f => f.name !== feature)
        : [...prev.features, {
            siteId: selectedSite?.id || '',
            name: feature,
            description: ''
          }]
    }))
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedSite) return

    if (!cloudinaryUrl || !uploadPreset || !apiKey) {
      setError('Cloudinary configuration is missing. Please check your environment variables.')
      return
    }

    setIsUploadingLogo(true)
    setError(null)

    try {
      const uploadedUrl = await handleFileChange(cloudinaryUrl, uploadPreset, apiKey, file)
      
      if (uploadedUrl && uploadedUrl.trim() !== '') {
        const result = await updateSiteLogo(selectedSite.id, uploadedUrl)
        
        if (result.success) {
          setSelectedSite(prev => prev ? { ...prev, logoUrl: uploadedUrl } : null)
          // Refresh the sites list to reflect changes
          loadAllSites()
        } else {
          setError(result.error || 'Failed to update site logo')
        }
      }
    } catch (err) {
      console.error('Error uploading logo:', err)
      setError('Failed to upload logo. Please try again.')
    } finally {
      setIsUploadingLogo(false)
      // Reset the input
      e.target.value = ''
    }
  }

  const handleLogoRemove = async () => {
    if (!selectedSite) return

    setIsUploadingLogo(true)
    setError(null)

    try {
      const result = await updateSiteLogo(selectedSite.id, null)
      
      if (result.success) {
        setSelectedSite(prev => prev ? { ...prev, logoUrl: null } : null)
        // Refresh the sites list to reflect changes
        loadAllSites()
      } else {
        setError(result.error || 'Failed to remove site logo')
      }
    } catch (err) {
      console.error('Error removing logo:', err)
      setError('Failed to remove logo. Please try again.')
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSite) return

    setIsSubmitting(true)
    setError(null)

    const result = await updateSitePackage({
      siteId: selectedSite.id,
      packageType: formData.packageType,
      features: formData.features
    })

    if (result.success) {
      // Update local state
      setSelectedSite(prev => prev ? {
        ...prev,
        packageType: formData.packageType,
        features: formData.features,
        updatedAt: new Date()
      } : null)
      
      // Refresh all sites list
      loadAllSites()
    } else {
      setError(result.error || 'Failed to update site package')
    }

    setIsSubmitting(false)
  }

  // Check if user is super admin
  if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-600">
            Only super administrators can access site settings.
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
            Manage site packages and available features
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-500">Super Admin Only</span>
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sites List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>All Sites</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {allSites.map((site) => (
                <button
                  key={site.id}
                  onClick={() => handleSiteSelect(site.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedSite?.id === site.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {site.logoUrl ? (
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden border">
                          <Image
                            src={site.logoUrl}
                            alt={`${site.name} logo`}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-lg border flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{site.name}</p>
                        <p className="text-sm text-gray-500">{site.domain}</p>
                      </div>
                    </div>
                    <Badge variant={site.packageType === SitePackage.ENTERPRISE ? 'default' : 'secondary'}>
                      {site.packageType}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                    <span>{site._count?.users || 0} users</span>
                    <span>{site._count?.products || 0} products</span>
                    <span>{site?.features?.length} features</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Package Configuration */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Package Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedSite ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {selectedSite.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Configure the package type and available features for this site.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="packageType">Package Type</Label>
                    <Select
                      value={formData.packageType}
                      onValueChange={(value) => handlePackageChange(value as SitePackage)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select package type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={SitePackage.BASIC}>Basic</SelectItem>
                        <SelectItem value={SitePackage.STANDARD}>Standard</SelectItem>
                        <SelectItem value={SitePackage.PREMIUM}>Premium</SelectItem>
                        <SelectItem value={SitePackage.ENTERPRISE}>Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Available Features</Label>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      {Object.values(SiteFeature).map((feature) => {
                        const isAvailable = PACKAGE_FEATURES[formData.packageType].includes(feature)
                        const isSelected = formData.features.some(f => f.name === feature)
                        
                        return (
                          <button
                            key={feature}
                            type="button"
                            onClick={() => handleFeatureToggle(feature)}
                            disabled={!isAvailable}
                            className={`p-3 rounded-lg border text-left transition-colors ${
                              isSelected && isAvailable
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : isAvailable
                                ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${
                                isSelected && isAvailable ? 'bg-blue-600' : 'bg-gray-300'
                              }`} />
                              <span className="font-medium">
                                {feature}
                              </span>
                            </div>
                            {!isAvailable && (
                              <p className="text-xs text-gray-400 mt-1">
                                Not available in {formData.packageType.toLowerCase()} package
                              </p>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Site Logo Upload */}
                <div className="space-y-4">
                  <div>
                    <Label>Site Logo</Label>
                    <p className="text-sm text-gray-600 mt-1">
                      Upload a logo for this site. Recommended size: 200x200px or larger.
                    </p>
                  </div>

                  {selectedSite.logoUrl ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border">
                          <Image
                            src={selectedSite.logoUrl}
                            alt={`${selectedSite.name} logo`}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Current Logo
                          </p>
                          <p className="text-xs text-gray-500">
                            Logo is uploaded and active
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleLogoRemove}
                          disabled={isUploadingLogo}
                          className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                      
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <div className="flex flex-col items-center">
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 mb-2">
                            Click to replace current logo
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            disabled={isUploadingLogo}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <div className="flex flex-col items-center">
                        {isUploadingLogo ? (
                          <>
                            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-2" />
                            <p className="text-sm text-gray-600">Uploading logo...</p>
                          </>
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 mb-2">
                              No logo uploaded yet
                            </p>
                            <p className="text-xs text-gray-500 mb-4">
                              PNG, JPG, GIF up to 10MB
                            </p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              disabled={isUploadingLogo}
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    Changes will take effect immediately
                  </p>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Select a site to configure its package</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Package Information */}
      <Card>
        <CardHeader>
          <CardTitle>Package Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Basic</h4>
              <p className="text-sm text-gray-600">Essential features for small businesses</p>
              <div className="space-y-1">
                {PACKAGE_FEATURES[SitePackage.BASIC].map(feature => (
                  <Badge key={feature} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Standard</h4>
              <p className="text-sm text-gray-600">Additional features for growing businesses</p>
              <div className="space-y-1">
                {PACKAGE_FEATURES[SitePackage.STANDARD].map(feature => (
                  <Badge key={feature} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Premium</h4>
              <p className="text-sm text-gray-600">Advanced features for established businesses</p>
              <div className="space-y-1">
                {PACKAGE_FEATURES[SitePackage.PREMIUM].map(feature => (
                  <Badge key={feature} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Enterprise</h4>
              <p className="text-sm text-gray-600">Complete feature set for large organizations</p>
              <div className="space-y-1">
                {PACKAGE_FEATURES[SitePackage.ENTERPRISE].map(feature => (
                  <Badge key={feature} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 