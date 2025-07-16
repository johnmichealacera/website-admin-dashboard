'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { FileText, Loader2 } from 'lucide-react'
import { About, AboutFormData } from '@/lib/types'
import { getAbout, createOrUpdateAbout } from '@/lib/actions/about'
import { useTenant } from '@/contexts/tenant-context'
import { ProductFeatureDescription as FeatureDescriptionConfig } from '@/components/forms/product-feature-description';
import { SiteFeature } from '@/lib/types';

export default function AboutPage() {
  const { currentSite } = useTenant()
  const [about, setAbout] = useState<About | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<AboutFormData>({
    siteId: currentSite?.id || '',
    title: '',
    content: '',
    mission: '',
    vision: '',
    values: [],
  })

  useEffect(() => {
    if (currentSite?.id) {
      loadAbout()
    }
  }, [currentSite?.id])

  const loadAbout = async () => {
    if (!currentSite?.id) return
    
    setLoading(true)
    const data = await getAbout(currentSite.id)
    setAbout(data)
    if (data) {
      setFormData({
        siteId: currentSite?.id || '',
        title: data.title,
        content: data.content,
        mission: data.mission || '',
        vision: data.vision || '',
        values: data.values || [],
      })
    }
    setLoading(false)
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (about) {
      setFormData({
        siteId: currentSite?.id || '',
        title: about.title,
        content: about.content,
        mission: about.mission || '',
        vision: about.vision || '',
        values: about.values || [],
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentSite?.id) {
      alert('No site selected')
      return
    }
    
    setIsSubmitting(true)

    try {
      const result = await createOrUpdateAbout(formData, currentSite.id)
      if (result.success) {
        setIsEditing(false)
        loadAbout()
      } else {
        alert(result.error || 'Failed to save about information')
      }
    } catch {
      alert('An error occurred while saving')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleValuesChange = (value: string) => {
    const values = value.split('\n').map(v => v.trim()).filter(v => v.length > 0)
    setFormData(prev => ({ ...prev, values }))
  }

  // Show message if no site is selected
  if (!currentSite) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Site Selected
          </h3>
          <p className="text-gray-600">
            Please select a site to manage about information.
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
          <p className="mt-2 text-gray-600">Loading about information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">About Us</h1>
          <p className="text-sm text-gray-500">
            Manage your about information for {currentSite.name}
          </p>
        </div>
        {!isEditing && (
          <Button onClick={handleEdit}>
            <FileText className="h-4 w-4 mr-2" />
            {about ? 'Edit About' : 'Add About'}
          </Button>
        )}
      </div>

      {/* Feature Description Config */}
      <Card>
        <CardHeader>
          <CardTitle>About Feature Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <FeatureDescriptionConfig siteId={currentSite.id} featureName={SiteFeature.ABOUT} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            About Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter your business story and information..."
                  rows={6}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mission">Mission Statement</Label>
                  <Textarea
                    id="mission"
                    value={formData.mission || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, mission: e.target.value }))}
                    placeholder="Your mission statement..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vision">Vision Statement</Label>
                  <Textarea
                    id="vision"
                    value={formData.vision || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, vision: e.target.value }))}
                    placeholder="Your vision statement..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="values">Company Values</Label>
                <Textarea
                  id="values"
                  value={formData.values.join('\n')}
                  onChange={(e) => handleValuesChange(e.target.value)}
                  placeholder="Enter each value on a new line..."
                  rows={4}
                />
                <p className="text-xs text-gray-500">
                  Enter each value on a new line
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save About Information
                </Button>
              </div>
            </form>
          ) : about ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">{about.title}</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{about.content}</p>
              </div>

              {about.mission && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Mission</h4>
                  <p className="text-gray-700">{about.mission}</p>
                </div>
              )}

              {about.vision && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Vision</h4>
                  <p className="text-gray-700">{about.vision}</p>
                </div>
              )}

              {about.values && about.values.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Our Values</h4>
                  <ul className="space-y-1">
                    {about.values.map((value, index) => (
                      <li key={index} className="text-gray-700">• {value}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No about information yet
              </h3>
              <p className="text-gray-600 mb-4">
                Add your business story and information to help customers learn about you.
              </p>
              <Button onClick={handleEdit}>
                <FileText className="h-4 w-4 mr-2" />
                Add About Information
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 