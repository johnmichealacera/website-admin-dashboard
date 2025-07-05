'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CategoryFormData } from '@/lib/types'
import { createCategory, updateCategory } from '@/lib/actions/categories'
import { Loader2 } from 'lucide-react'

interface CategoryFormProps {
  initialData?: Partial<CategoryFormData>
  categoryId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function CategoryForm({ initialData, categoryId, onSuccess, onCancel }: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<CategoryFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = categoryId 
        ? await updateCategory(categoryId, formData)
        : await createCategory(formData)

      if (result.success) {
        onSuccess?.()
      } else {
        alert(result.error || 'Failed to save category')
      }
    } catch {
      alert('An error occurred while saving the category')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {categoryId ? 'Edit Category' : 'Add New Category'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter category name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter category description"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {categoryId ? 'Update Category' : 'Add Category'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 