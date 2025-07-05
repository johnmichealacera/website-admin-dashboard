'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Phone, Loader2, Mail, MapPin, Globe } from 'lucide-react'
import { Contact, ContactFormData } from '@/lib/types'
import { getContact, createOrUpdateContact } from '@/lib/actions/contact'

export default function ContactPage() {
  const [contact, setContact] = useState<Contact | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<ContactFormData>({
    businessName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    socialLinks: {},
  })

  useEffect(() => {
    loadContact()
  }, [])

  const loadContact = async () => {
    setLoading(true)
    const data = await getContact()
    setContact(data)
    if (data) {
      setFormData({
        businessName: data.businessName,
        email: data.email,
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
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
        businessName: contact.businessName,
        email: contact.email,
        phone: contact.phone || '',
        address: contact.address || '',
        city: contact.city || '',
        state: contact.state || '',
        zipCode: contact.zipCode || '',
        country: contact.country || '',
        socialLinks: contact.socialLinks || {},
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await createOrUpdateContact(formData)
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
            Manage your business contact details
          </p>
        </div>
        {!isEditing && (
          <Button onClick={handleEdit}>
            <Phone className="h-4 w-4 mr-2" />
            {contact ? 'Edit Contact' : 'Add Contact'}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Phone className="h-5 w-5 mr-2" />
            Business Contact Details
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
                    placeholder="Your business name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="contact@business.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="State"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                    placeholder="12345"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="Country"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Social Media Links</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={formData.socialLinks?.instagram || ''}
                      onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                      placeholder="https://instagram.com/yourhandle"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={formData.socialLinks?.facebook || ''}
                      onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                      placeholder="https://facebook.com/yourpage"
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
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center text-gray-900 mb-1">
                      <Globe className="h-4 w-4 mr-2" />
                      <span className="font-medium">Business Name</span>
                    </div>
                    <p className="text-gray-700">{contact.businessName}</p>
                  </div>

                  <div>
                    <div className="flex items-center text-gray-900 mb-1">
                      <Mail className="h-4 w-4 mr-2" />
                      <span className="font-medium">Email</span>
                    </div>
                    <p className="text-gray-700">{contact.email}</p>
                  </div>

                  {contact.phone && (
                    <div>
                      <div className="flex items-center text-gray-900 mb-1">
                        <Phone className="h-4 w-4 mr-2" />
                        <span className="font-medium">Phone</span>
                      </div>
                      <p className="text-gray-700">{contact.phone}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {contact.address && (
                    <div>
                      <div className="flex items-center text-gray-900 mb-1">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="font-medium">Address</span>
                      </div>
                      <div className="text-gray-700">
                        <p>{contact.address}</p>
                        {contact.city && (
                          <p>
                            {contact.city}
                            {contact.state && `, ${contact.state}`}
                            {contact.zipCode && ` ${contact.zipCode}`}
                          </p>
                        )}
                        {contact.country && <p>{contact.country}</p>}
                      </div>
                    </div>
                  )}

                  {contact.socialLinks && Object.keys(contact.socialLinks).length > 0 && (
                    <div>
                      <div className="font-medium text-gray-900 mb-2">Social Media</div>
                      <div className="space-y-1">
                        {Object.entries(contact.socialLinks).map(([platform, url]) => (
                          <div key={platform} className="text-gray-700">
                            <span className="capitalize">{platform}:</span>{' '}
                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {url}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
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