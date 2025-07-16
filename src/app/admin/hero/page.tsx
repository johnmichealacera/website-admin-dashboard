'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Image as HeroIcon, Save, Loader2, Monitor, Smartphone } from 'lucide-react'
import { useTenant } from '@/contexts/tenant-context'
import { Hero } from '@/lib/types'
import HeroComponent from '@/components/hero/hero'

interface HeroFormData {
  title: string
  subtitle: string
  description: string
  imageUrl: string
  videoUrl: string
  ctaButton: string
  ctaLink: string
}

export default function HeroAdminPage() {
  const { currentSite } = useTenant()
  const [formData, setFormData] = useState<HeroFormData>({
    title: '',
    subtitle: '',
    description: '',
    imageUrl: '',
    videoUrl: '',
    ctaButton: '',
    ctaLink: ''
  })
  const [heroData, setHeroData] = useState<Hero | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')

  useEffect(() => {
    if (currentSite?.id) {
      loadHeroData()
    }
  }, [currentSite?.id])

  const loadHeroData = async () => {
    if (!currentSite?.id) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/site-hero?siteId=${currentSite.id}`)
      const result = await response.json()
      
      if (result.success && result.hero) {
        const hero = result.hero
        setHeroData(hero)
        setFormData({
          title: hero.title || '',
          subtitle: hero.subtitle || '',
          description: hero.description || '',
          imageUrl: hero.imageUrl || '',
          videoUrl: hero.videoUrl || '',
          ctaButton: hero.ctaButton || '',
          ctaLink: hero.ctaLink || ''
        })
      }
    } catch (error) {
      console.error('Error loading hero data:', error)
      setMessage({ type: 'error', text: 'Failed to load hero data' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof HeroFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Update hero data for preview
    setHeroData(prev => ({
      id: prev?.id || '',
      siteId: currentSite?.id || '',
      title: field === 'title' ? (value || null) : (prev?.title || null),
      subtitle: field === 'subtitle' ? (value || null) : (prev?.subtitle || null),
      description: field === 'description' ? (value || null) : (prev?.description || null),
      imageUrl: field === 'imageUrl' ? (value || null) : (prev?.imageUrl || null),
      videoUrl: field === 'videoUrl' ? (value || null) : (prev?.videoUrl || null),
      ctaButton: field === 'ctaButton' ? (value || null) : (prev?.ctaButton || null),
      ctaLink: field === 'ctaLink' ? (value || null) : (prev?.ctaLink || null),
      createdAt: prev?.createdAt || new Date(),
      updatedAt: new Date()
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentSite?.id) return

    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch('/api/site-hero', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteId: currentSite.id,
          ...formData
        })
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: 'Hero section updated successfully!' })
        setHeroData(result.hero)
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update hero section' })
      }
    } catch (error) {
      console.error('Error updating hero:', error)
      setMessage({ type: 'error', text: 'Failed to update hero section' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!currentSite) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <HeroIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Site Selected
          </h3>
          <p className="text-gray-600">
            Please select a site to manage the hero section.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hero Section</h1>
          <p className="text-sm text-gray-500">
            Configure the hero section for {currentSite.name}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={previewMode === 'desktop' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreviewMode('desktop')}
          >
            <Monitor className="h-4 w-4 mr-2" />
            Desktop
          </Button>
          <Button
            variant={previewMode === 'mobile' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreviewMode('mobile')}
          >
            <Smartphone className="h-4 w-4 mr-2" />
            Mobile
          </Button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Hero Configuration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HeroIcon className="h-5 w-5" />
              <span>Hero Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading hero configuration...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter hero title"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Input
                      id="subtitle"
                      value={formData.subtitle}
                      onChange={(e) => handleInputChange('subtitle', e.target.value)}
                      placeholder="Enter hero subtitle"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Enter hero description"
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="imageUrl">Background Image URL</Label>
                    <Input
                      id="imageUrl"
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                      placeholder="https://example.com/hero-image.jpg"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      High resolution image recommended (1920x1080 or larger)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="videoUrl">Background Video URL</Label>
                    <Input
                      id="videoUrl"
                      type="url"
                      value={formData.videoUrl}
                      onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                      placeholder="https://example.com/hero-video.mp4"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Video will take priority over image. Use MP4 format for best compatibility.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="ctaButton">Call-to-Action Button Text</Label>
                    <Input
                      id="ctaButton"
                      value={formData.ctaButton}
                      onChange={(e) => handleInputChange('ctaButton', e.target.value)}
                      placeholder="Get Started"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ctaLink">Call-to-Action Link</Label>
                    <Input
                      id="ctaLink"
                      type="url"
                      value={formData.ctaLink}
                      onChange={(e) => handleInputChange('ctaLink', e.target.value)}
                      placeholder="/contact or https://example.com"
                      className="mt-1"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Hero Configuration
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Live Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className={`relative border rounded-lg overflow-hidden ${
              previewMode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
            }`}>
              <div className="bg-gray-100 text-xs text-gray-500 px-3 py-2 border-b">
                {previewMode === 'desktop' ? '1200px Desktop' : '375px Mobile'}
              </div>
              <div className={`transform origin-top ${
                previewMode === 'mobile' ? 'scale-50' : 'scale-75'
              }`}>
                <div style={{ 
                  width: previewMode === 'mobile' ? '375px' : '1200px',
                  height: previewMode === 'mobile' ? '600px' : '500px'
                }}>
                  <HeroComponent 
                    heroData={heroData}
                    colorPalette={currentSite.colorPalette}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Background Priority</h4>
              <p>If both image and video are provided, video will be used as the background. If neither is provided, a gradient background using your site colors will be displayed.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Fallback Content</h4>
              <p>If no content is provided, default fallback text will be displayed using your site name and description.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Call-to-Action</h4>
              <p>The CTA button will only appear if both button text and link are provided. Links can be relative (e.g., &quot;/contact&quot;) or absolute (e.g., &quot;https://example.com&quot;).</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Responsive Design</h4>
              <p>The hero section automatically adapts to different screen sizes. Text sizes, spacing, and layout will adjust for optimal viewing on all devices.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 