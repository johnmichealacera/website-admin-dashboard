'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CategoryForm } from '@/components/forms/category-form'
import { Plus, Tags, Edit, Trash2 } from 'lucide-react'
import { CategoryWithProducts } from '@/lib/types'
import { getCategories, deleteCategory } from '@/lib/actions/categories'
import { formatDate } from '@/lib/utils'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithProducts[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryWithProducts | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    const data = await getCategories()
    setCategories(data)
    setLoading(false)
  }

  const handleAddCategory = () => {
    setEditingCategory(null)
    setShowForm(true)
  }

  const handleEditCategory = (category: CategoryWithProducts) => {
    setEditingCategory(category)
    setShowForm(true)
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return
    }

    const result = await deleteCategory(id)
    if (result.success) {
      loadCategories()
    } else {
      alert(result.error || 'Failed to delete category')
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingCategory(null)
    loadCategories()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingCategory(null)
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <p className="text-sm text-gray-500">
              {editingCategory ? 'Edit category' : 'Add new category'}
            </p>
          </div>
        </div>

        <CategoryForm
          initialData={editingCategory || undefined}
          categoryId={editingCategory?.id}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500">
            Manage your product categories
          </p>
        </div>
        <Button onClick={handleAddCategory}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Tags className="h-5 w-5 mr-2" />
            Product Categories ({categories.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <Tags className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No categories yet
              </h3>
              <p className="text-gray-600 mb-4">
                Create your first product category to start organizing your inventory.
              </p>
              <Button onClick={handleAddCategory}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Category
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <Card key={category.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          {category.products.length} products
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
                          disabled={category.products.length > 0}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {category.description && (
                      <p className="text-sm text-gray-600 mb-3">
                        {category.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Created {formatDate(new Date(category.createdAt))}</span>
                      {category.products.length > 0 && (
                        <span className="text-orange-600">
                          Has products
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 