'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductFormData, Category } from '@/lib/types'
import { getCategoriesSimple } from '@/lib/actions/categories'
import { createProduct, updateProduct } from '@/lib/actions/products'
import { Loader2 } from 'lucide-react'

interface ProductFormProps {
  initialData?: Partial<ProductFormData>
  productId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function ProductForm({ initialData, productId, onSuccess, onCancel }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    stock: initialData?.stock || 0,
    imageUrls: initialData?.imageUrls || [],
    isActive: initialData?.isActive ?? true,
    categoryId: initialData?.categoryId || '',
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    const data = await getCategoriesSimple()
    setCategories(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = productId 
        ? await updateProduct(productId, formData)
        : await createProduct(formData)

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

  const handleImageUrlsChange = (value: string) => {
    // Convert comma-separated string to array
    const urls = value.split(',').map(url => url.trim()).filter(url => url.length > 0)
    setFormData(prev => ({ ...prev, imageUrls: urls }))
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
              <Select
                id="category"
                value={formData.categoryId}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
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
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
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
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrls">Image URLs</Label>
            <Textarea
              id="imageUrls"
              value={formData.imageUrls.join(', ')}
              onChange={(e) => handleImageUrlsChange(e.target.value)}
              placeholder="Enter image URLs separated by commas"
              rows={2}
            />
            <p className="text-xs text-gray-500">
              Enter multiple image URLs separated by commas
            </p>
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {productId ? 'Update Product' : 'Add Product'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 