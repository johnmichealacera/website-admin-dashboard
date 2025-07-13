'use server'

import { db } from '@/lib/db'
import { CategoryFormData, CategoryWithProducts, ApiResponse } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function getCategories(siteId: string): Promise<CategoryWithProducts[]> {
  try {
    const categories = await db.category.findMany({
      where: {
        siteId: siteId,
      },
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

export async function getCategoriesSimple(siteId: string): Promise<{ id: string; name: string }[]> {
  try {
    const categories = await db.category.findMany({
      where: {
        siteId: siteId,
      },
      select: {
        id: true,
        name: true,
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

export async function getCategoryById(id: string, siteId: string): Promise<CategoryWithProducts | null> {
  try {
    const category = await db.category.findFirst({
      where: { 
        id: id,
        siteId: siteId,
      },
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

export async function createCategory(data: CategoryFormData, siteId: string): Promise<ApiResponse<CategoryWithProducts>> {
  try {
    const category = await db.category.create({
      data: {
        name: data.name,
        description: data.description,
        siteId: siteId,
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

export async function updateCategory(id: string, data: Partial<CategoryFormData>, siteId: string): Promise<ApiResponse<CategoryWithProducts>> {
  try {
    const category = await db.category.updateMany({
      where: { 
        id: id,
        siteId: siteId,
      },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
      },
    })

    if (category.count === 0) {
      return {
        success: false,
        error: 'Category not found or you do not have permission to update it',
      }
    }

    // Fetch the updated category to return
    const updatedCategory = await db.category.findFirst({
      where: { 
        id: id,
        siteId: siteId,
      },
      include: {
        products: true,
      },
    })

    revalidatePath('/admin/categories')
    revalidatePath('/admin')

    return {
      success: true,
      data: updatedCategory!,
    }
  } catch (error) {
    console.error('Error updating category:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update category',
    }
  }
}

export async function deleteCategory(id: string, siteId: string): Promise<ApiResponse<void>> {
  try {
    // First check if category has any products
    const categoryWithProducts = await db.category.findFirst({
      where: { 
        id: id,
        siteId: siteId,
      },
      include: {
        products: true,
      },
    })

    if (!categoryWithProducts) {
      return {
        success: false,
        error: 'Category not found',
      }
    }

    if (categoryWithProducts.products.length > 0) {
      return {
        success: false,
        error: 'Cannot delete category with products. Please move or delete all products first.',
      }
    }

    const result = await db.category.deleteMany({
      where: { 
        id: id,
        siteId: siteId,
      },
    })

    if (result.count === 0) {
      return {
        success: false,
        error: 'Category not found or you do not have permission to delete it',
      }
    }

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