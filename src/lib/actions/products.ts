'use server'

import { db } from '@/lib/db'
import { ProductFormData, ProductWithCategory, ApiResponse } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function getProducts(siteId: string): Promise<ProductWithCategory[]> {
  try {
    const products = await db.product.findMany({
      where: {
        siteId: siteId,
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return products
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export async function getProductById(id: string, siteId: string): Promise<ProductWithCategory | null> {
  try {
    const product = await db.product.findUnique({
      where: { 
        id,
        siteId: siteId,
      },
      include: {
        category: true,
      },
    })
    return product
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export async function createProduct(data: ProductFormData, siteId: string): Promise<ApiResponse<ProductWithCategory>> {
  try {
    const product = await db.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        imageUrls: data.imageUrls,
        isActive: data.isActive,
        categoryId: data.categoryId,
        siteId: siteId,
      },
      include: {
        category: true,
      },
    })

    revalidatePath('/admin/products')
    revalidatePath('/admin')

    return {
      success: true,
      data: product,
    }
  } catch (error) {
    console.error('Error creating product:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create product',
    }
  }
}

export async function updateProduct(id: string, data: Partial<ProductFormData>, siteId: string): Promise<ApiResponse<ProductWithCategory>> {
  try {
    const product = await db.product.update({
      where: { 
        id,
        siteId: siteId,
      },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.stock !== undefined && { stock: data.stock }),
        ...(data.imageUrls !== undefined && { imageUrls: data.imageUrls }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.categoryId && { categoryId: data.categoryId }),
      },
      include: {
        category: true,
      },
    })

    revalidatePath('/admin/products')
    revalidatePath('/admin')

    return {
      success: true,
      data: product,
    }
  } catch (error) {
    console.error('Error updating product:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update product',
    }
  }
}

export async function deleteProduct(id: string, siteId: string): Promise<ApiResponse<void>> {
  try {
    await db.product.delete({
      where: { 
        id,
        siteId: siteId,
      },
    })

    revalidatePath('/admin/products')
    revalidatePath('/admin')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error deleting product:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete product',
    }
  }
}

export async function getLowStockProducts(siteId: string): Promise<ProductWithCategory[]> {
  try {
    const products = await db.product.findMany({
      where: {
        siteId: siteId,
        stock: {
          lt: 5,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        stock: 'asc',
      },
    })
    return products
  } catch (error) {
    console.error('Error fetching low stock products:', error)
    return []
  }
}

export async function getProductsStats(siteId: string): Promise<{
  totalProducts: number
  lowStockProducts: number
  totalInventoryValue: number
  activeProducts: number
}> {
  try {
    const [totalProducts, lowStockProducts, allProducts, activeProducts] = await Promise.all([
      db.product.count({
        where: {
          siteId: siteId,
        },
      }),
      db.product.count({
        where: {
          siteId: siteId,
          stock: {
            lt: 5,
          },
        },
      }),
      db.product.findMany({
        where: {
          siteId: siteId,
        },
        select: {
          price: true,
          stock: true,
        },
      }),
      db.product.count({
        where: {
          siteId: siteId,
          isActive: true,
        },
      }),
    ])

    const totalInventoryValue = allProducts.reduce((sum, product) => {
      return sum + (product.price * product.stock)
    }, 0)

    return {
      totalProducts,
      lowStockProducts,
      totalInventoryValue,
      activeProducts,
    }
  } catch (error) {
    console.error('Error fetching product stats:', error)
    return {
      totalProducts: 0,
      lowStockProducts: 0,
      totalInventoryValue: 0,
      activeProducts: 0,
    }
  }
} 