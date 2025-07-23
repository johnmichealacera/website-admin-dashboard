'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductFormData, Category } from '@/lib/types'
import { getCategoriesSimple } from '@/lib/actions/categories'
import { createProduct, updateProduct } from '@/lib/actions/products'
import { Loader2, Upload, X } from 'lucide-react'
import { uploadToCloudinary } from "@/lib/utils/cloudinary-upload";
import { OptimizationStatus } from "@/components/ui/optimization-status";
import Image from 'next/image'
import { useTenant } from '@/contexts/tenant-context'

interface ProductFormProps {
  initialData?: Partial<ProductFormData>
  productId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function ProductForm({ initialData, productId, onSuccess, onCancel }: ProductFormProps) {
  const { currentSite } = useTenant()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState<ProductFormData>({
    siteId: currentSite?.id || '',
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    stock: initialData?.stock || 0,
    imageUrls: initialData?.imageUrls || [],
    isActive: initialData?.isActive ?? true,
    categoryId: initialData?.categoryId || '',
  })

  // Cloudinary configuration
  const cloudinaryUrl = process.env.NEXT_PUBLIC_CLOUDINARY_URL
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY

  useEffect(() => {
    if (currentSite?.id) {
      loadCategories()
    }
  }, [currentSite?.id])

  const loadCategories = async () => {
    if (!currentSite?.id) return
    
    const data = await getCategoriesSimple(currentSite.id)
    setCategories(data as Category[])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentSite?.id) {
      alert('No site selected')
      return
    }
    
    setIsSubmitting(true)

    try {
      const result = productId 
        ? await updateProduct(productId, formData, currentSite.id)
        : await createProduct(formData, currentSite.id)

      if (result.success) {
        onSuccess?.()
      } else {
        alert(result.error || 'Failed to save product')
      }
    } catch {
      alert('An error occurred while saving the product')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    // Only take the first file since we only allow one image
    const file = files[0]

    if (!cloudinaryUrl || !uploadPreset || !apiKey) {
      alert('Cloudinary configuration is missing. Please check your environment variables.')
      return
    }

    setIsUploading(true)
    
    try {
      const result = await uploadToCloudinary(file, {
        cloudinaryUrl,
        uploadPreset,
        apiKey,
        enableWebPOptimization: true,
        showOptimizationInfo: true
      })

      if (result.url && result.url.trim() !== '') {
        // Replace the existing image with the new one
        setFormData(prev => ({
          ...prev,
          imageUrls: [result.url]
        }))
      }
    } catch (err) {
      console.error('Error uploading file:', err)
      alert('Failed to upload image. Please try again.')
    } finally {
      setIsUploading(false)
      // Reset the input
      e.target.value = ''
    }
  }

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      imageUrls: []
    }))
  }

  // Show message if no site is selected
  if (!currentSite) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No site selected. Please select a site to continue.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {productId ? 'Edit Product' : 'Add New Product'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.categoryId} onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))} required>
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter product description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity *</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Product Image</Label>
              <OptimizationStatus showDetails={true} />
            </div>
            
            {/* Image Upload */}
            <div className="space-y-2">
              <div className="flex items-center justify-center w-full">
                <label htmlFor="imageUpload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  {isUploading ? (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                      <p className="text-sm text-gray-500">Uploading image...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> product image
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  )}
                  <input
                    id="imageUpload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>

            {/* Image Preview */}
            {formData.imageUrls.length > 0 && (
              <div className="space-y-2">
                <Label>Current Image</Label>
                <div className="relative inline-block">
                  <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border">
                    <Image
                      width={128}
                      height={128}
                      src={formData.imageUrls[0]}
                      alt="Product image"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback for broken images
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.parentElement?.insertAdjacentHTML('afterbegin', 
                          `<div class="w-full h-full flex items-center justify-center text-gray-400">
                            <div class="text-center">
                              <svg class="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                              </svg>
                              <p class="text-xs">Image Error</p>
                            </div>
                          </div>`
                        )
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isActive">Product is active</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {productId ? 'Update Product' : 'Add Product'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 