'use server'

import { db } from '@/lib/db'
import { GalleryItemFormData, GalleryItem, ApiResponse } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function getGalleryItems(siteId: string): Promise<GalleryItem[]> {
  try {
    const galleryItems = await db.galleryItem.findMany({
      where: { siteId },
      orderBy: { createdAt: 'desc' }
    })
    return galleryItems
  } catch (error) {
    console.error('Error fetching gallery items:', error)
    return []
  }
}

export async function getGalleryItem(id: string, siteId: string): Promise<ApiResponse<GalleryItem>> {
  try {
    const galleryItem = await db.galleryItem.findFirst({
      where: { id, siteId }
    })

    if (!galleryItem) {
      return { success: false, error: 'Gallery item not found' }
    }

    return { success: true, data: galleryItem }
  } catch (error) {
    console.error('Error fetching gallery item:', error)
    return { success: false, error: 'Failed to fetch gallery item' }
  }
}

export async function createGalleryItem(data: GalleryItemFormData, siteId: string): Promise<ApiResponse<GalleryItem>> {
  try {
    const galleryItem = await db.galleryItem.create({
      data: {
        title: data.title,
        imageUrl: data.imageUrl,
        description: data.description,
        projectDate: data.projectDate,
        tags: data.tags,
        isFeatured: data.isFeatured,
        siteId: siteId,
      }
    })

    revalidatePath('/admin/gallery')
    revalidatePath('/admin')

    return { success: true, data: galleryItem }
  } catch (error) {
    console.error('Error creating gallery item:', error)
    return { success: false, error: 'Failed to create gallery item' }
  }
}

export async function updateGalleryItem(id: string, data: GalleryItemFormData, siteId: string): Promise<ApiResponse<GalleryItem>> {
  try {
    const galleryItem = await db.galleryItem.update({
      where: { id, siteId },
      data: {
        title: data.title,
        imageUrl: data.imageUrl,
        description: data.description,
        projectDate: data.projectDate,
        tags: data.tags,
        isFeatured: data.isFeatured,
      }
    })

    revalidatePath('/admin/gallery')
    revalidatePath('/admin')

    return { success: true, data: galleryItem }
  } catch (error) {
    console.error('Error updating gallery item:', error)
    return { success: false, error: 'Failed to update gallery item' }
  }
}

export async function deleteGalleryItem(id: string, siteId: string): Promise<ApiResponse<void>> {
  try {
    await db.galleryItem.delete({
      where: { id, siteId }
    })

    revalidatePath('/admin/gallery')
    revalidatePath('/admin')

    return { success: true }
  } catch (error) {
    console.error('Error deleting gallery item:', error)
    return { success: false, error: 'Failed to delete gallery item' }
  }
} 