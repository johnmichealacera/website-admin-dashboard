'use server'

import { db } from '@/lib/db'
import { CategoryFormData, CategoryWithProducts, ApiResponse } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function getCategories(): Promise<CategoryWithProducts[]> {
  try {
    const categories = await db.category.findMany({
      include: {
        products: true,
      },
      orderBy: {
        name: 'asc',
      },
    })
    return categories
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export async function getCategoriesSimple() {
  try {
    const categories = await db.category.findMany({
      orderBy: {
        name: 'asc',
      },
    })
    return categories
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export async function getCategoryById(id: string): Promise<CategoryWithProducts | null> {
  try {
    const category = await db.category.findUnique({
      where: { id },
      include: {
        products: true,
      },
    })
    return category
  } catch (error) {
    console.error('Error fetching category:', error)
    return null
  }
}

export async function createCategory(data: CategoryFormData): Promise<ApiResponse<CategoryWithProducts>> {
  try {
    const category = await db.category.create({
      data: {
        name: data.name,
        description: data.description,
      },
      include: {
        products: true,
      },
    })

    revalidatePath('/admin/categories')
    revalidatePath('/admin')

    return {
      success: true,
      data: category,
    }
  } catch (error) {
    console.error('Error creating category:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create category',
    }
  }
}

export async function updateCategory(id: string, data: Partial<CategoryFormData>): Promise<ApiResponse<CategoryWithProducts>> {
  try {
    const category = await db.category.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
      },
      include: {
        products: true,
      },
    })

    revalidatePath('/admin/categories')
    revalidatePath('/admin')

    return {
      success: true,
      data: category,
    }
  } catch (error) {
    console.error('Error updating category:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update category',
    }
  }
}

export async function deleteCategory(id: string): Promise<ApiResponse<null>> {
  try {
    // Check if category has products
    const productCount = await db.product.count({
      where: { categoryId: id },
    })

    if (productCount > 0) {
      return {
        success: false,
        error: 'Cannot delete category with existing products. Please reassign or delete products first.',
      }
    }

    await db.category.delete({
      where: { id },
    })

    revalidatePath('/admin/categories')
    revalidatePath('/admin')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error deleting category:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete category',
    }
  }
} 