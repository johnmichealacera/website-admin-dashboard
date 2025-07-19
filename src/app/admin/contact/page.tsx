'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Phone, Loader2, Mail, Globe } from 'lucide-react'
import { Contact, ContactFormData } from '@/lib/types'
import { getContact, createOrUpdateContact } from '@/lib/actions/contact'
import { useTenant } from '@/contexts/tenant-context'
import { ProductFeatureDescription as FeatureDescriptionConfig } from '@/components/forms/product-feature-description';
import { SiteFeature } from '@/lib/types';

export default function ContactPage() {
  const { currentSite } = useTenant()
  const [contact, setContact] = useState<Contact | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<ContactFormData>({
    siteId: currentSite?.id || '',
    businessName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    zipCode: '',
    country: '',
    socialLinks: {},
  })

  useEffect(() => {
    if (currentSite?.id) {
      loadContact()
    }
  }, [currentSite?.id])

  const loadContact = async () => {
    if (!currentSite?.id) return
    
    setLoading(true)
    const data = await getContact(currentSite.id)
    setContact(data)
    if (data) {
      setFormData({
        siteId: currentSite?.id || '',
        businessName: data.businessName,
        email: data.email,
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        province: data.province || '',
        zipCode: data.zipCode || '',
        country: data.country || '',
        socialLinks: data.socialLinks || {},
      })
    }
    setLoading(false)
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (contact) {
      setFormData({
        siteId: currentSite?.id || '',
        businessName: contact.businessName,
        email: contact.email,
        phone: contact.phone || '',
        address: contact.address || '',
        city: contact.city || '',
        province: contact.province || '',
        zipCode: contact.zipCode || '',
        country: contact.country || '',
        socialLinks: contact.socialLinks || {},
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
      const result = await createOrUpdateContact(formData, currentSite.id)
      if (result.success) {
        setIsEditing(false)
        loadContact()
      } else {
        alert(result.error || 'Failed to save contact information')
      }
    } catch {
      alert('An error occurred while saving')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSocialLinkChange = (platform: string, url: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: url,
      }
    }))
  }

  // Show message if no site is selected
  if (!currentSite) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Phone className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Site Selected
          </h3>
          <p className="text-gray-600">
            Please select a site to manage contact information.
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
          <p className="mt-2 text-gray-600">Loading contact information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Information</h1>
          <p className="text-sm text-gray-500">
            Manage your business contact details for {currentSite.name}
          </p>
        </div>
        {!isEditing && (
          <Button onClick={handleEdit}>
            <Phone className="h-4 w-4 mr-2" />
            {contact ? 'Edit Contact' : 'Add Contact'}
          </Button>
        )}
      </div>

      {/* Feature Description Config */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Feature Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <FeatureDescriptionConfig siteId={currentSite.id} featureName={SiteFeature.CONTACT} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Phone className="h-5 w-5 mr-2" />
            Contact Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                    placeholder="Enter business name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter street address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Enter city"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="province">Province</Label>
                  <Input
                    id="province"
                    value={formData.province || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, province: e.target.value }))}
                    placeholder="Enter province"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                    placeholder="Enter ZIP code"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="Enter country"
                />
              </div>

              <div className="space-y-4">
                <Label>Social Media Links</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={formData.socialLinks?.facebook || ''}
                      onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      value={formData.socialLinks?.twitter || ''}
                      onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                      placeholder="https://twitter.com/youraccount"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={formData.socialLinks?.instagram || ''}
                      onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                      placeholder="https://instagram.com/youraccount"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tiktok">TikTok</Label>
                    <Input
                      id="tiktok"
                      value={formData.socialLinks?.tiktok || ''}
                      onChange={(e) => handleSocialLinkChange('tiktok', e.target.value)}
                      placeholder="https://tiktok.com/@youraccount"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="youtube">YouTube</Label>
                    <Input
                      id="youtube"
                      value={formData.socialLinks?.youtube || ''}
                      onChange={(e) => handleSocialLinkChange('youtube', e.target.value)}
                      placeholder="https://youtube.com/@yourchannel"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={formData.socialLinks?.linkedin || ''}
                      onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                      placeholder="https://linkedin.com/company/yourcompany"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="spotify">Spotify</Label>
                    <Input
                      id="spotify"
                      value={formData.socialLinks?.spotify || ''}
                      onChange={(e) => handleSocialLinkChange('spotify', e.target.value)}
                      placeholder="https://open.spotify.com/artist/yourartist"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.socialLinks?.website || ''}
                      onChange={(e) => handleSocialLinkChange('website', e.target.value)}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Contact Information
                </Button>
              </div>
            </form>
          ) : contact ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Business Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{contact.businessName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{contact.email}</span>
                    </div>
                    {contact.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Address</h3>
                  <div className="space-y-1 text-gray-700">
                    {contact.address && <p>{contact.address}</p>}
                    {(contact.city || contact.province || contact.zipCode) && (
                      <p>
                        {[contact.city, contact.province, contact.zipCode].filter(Boolean).join(', ')}
                      </p>
                    )}
                    {contact.country && <p>{contact.country}</p>}
                  </div>
                </div>
              </div>

              {contact.socialLinks && Object.keys(contact.socialLinks).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Social Media</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(contact.socialLinks).map(([platform, url]) => (
                      <div key={platform} className="flex items-center space-x-2">
                        <span className="font-medium capitalize">{platform}:</span>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 truncate"
                        >
                          {url}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Phone className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No contact information yet
              </h3>
              <p className="text-gray-600 mb-4">
                Add your business contact details to help customers reach you.
              </p>
              <Button onClick={handleEdit}>
                <Phone className="h-4 w-4 mr-2" />
                Add Contact Information
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 