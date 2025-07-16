'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProductForm } from '@/components/forms/product-form'
import { Plus, Package, Edit, Trash2 } from 'lucide-react'
import { ProductWithCategory } from '@/lib/types'
import { getProducts, deleteProduct } from '@/lib/actions/products'
import { formatPrice, formatDate } from '@/lib/utils'
import { useTenant } from '@/contexts/tenant-context'
import { ProductFeatureDescription } from '@/components/forms/product-feature-description';
import { SiteFeature } from '@/lib/types';

export default function ProductsPage() {
  const { currentSite } = useTenant()
  const [products, setProducts] = useState<ProductWithCategory[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductWithCategory | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentSite?.id) {
      loadProducts()
    }
  }, [currentSite?.id])

  const loadProducts = async () => {
    if (!currentSite?.id) return
    
    setLoading(true)
    const data = await getProducts(currentSite.id)
    setProducts(data)
    setLoading(false)
  }

  const handleAddProduct = () => {
    setEditingProduct(null)
    setShowForm(true)
  }

  const handleEditProduct = (product: ProductWithCategory) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleDeleteProduct = async (id: string) => {
    if (!currentSite?.id) return
    
    if (!confirm('Are you sure you want to delete this product?')) {
      return
    }

    const result = await deleteProduct(id, currentSite.id)
    if (result.success) {
      loadProducts()
    } else {
      alert(result.error || 'Failed to delete product')
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingProduct(null)
    loadProducts()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingProduct(null)
  }

  // Show message if no site is selected
  if (!currentSite) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Site Selected
          </h3>
          <p className="text-gray-600">
            Please select a site to manage products.
          </p>
        </div>
      </div>
    )
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-sm text-gray-500">
              {editingProduct ? 'Edit product' : 'Add new product'}
            </p>
          </div>
        </div>

        <ProductForm
          initialData={editingProduct || undefined}
          productId={editingProduct?.id}
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
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">
            Manage your product inventory for {currentSite.name}
          </p>
        </div>
        <Button onClick={handleAddProduct}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>
      {/* Feature Description Config */}
      <Card>
        <CardHeader>
          <CardTitle>Product Feature Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductFeatureDescription siteId={currentSite.id} featureName={SiteFeature.PRODUCTS} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Product Inventory ({products.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No products yet
              </h3>
              <p className="text-gray-600 mb-4">
                Get started by adding your first product to the inventory.
              </p>
              <Button onClick={handleAddProduct}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Product
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Product</th>
                    <th className="text-left p-2">Category</th>
                    <th className="text-left p-2">Price</th>
                    <th className="text-left p-2">Stock</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Created</th>
                    <th className="text-right p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          {product.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {product.category.name}
                        </span>
                      </td>
                      <td className="p-2 font-medium">
                        {formatPrice(product.price)}
                      </td>
                      <td className="p-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.stock < 5 
                            ? 'bg-red-100 text-red-800' 
                            : product.stock < 10 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {product.stock} units
                        </span>
                      </td>
                      <td className="p-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-2 text-sm text-gray-500">
                        {formatDate(new Date(product.createdAt))}
                      </td>
                      <td className="p-2">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 