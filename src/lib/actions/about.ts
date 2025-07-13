'use server'

import { db } from '@/lib/db'
import { AboutFormData, ApiResponse, About } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function getAbout(siteId: string): Promise<About | null> {
  try {
    const about = await db.about.findFirst({
      where: {
        siteId: siteId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return about
  } catch (error) {
    console.error('Error fetching about:', error)
    return null
  }
}

export async function createOrUpdateAbout(data: AboutFormData, siteId: string): Promise<ApiResponse<About>> {
  try {
    // First check if about record exists for this site
    const existingAbout = await db.about.findFirst({
      where: {
        siteId: siteId,
      },
    })

    let about: About | null = null

    if (existingAbout) {
      // Update existing record
      const result = await db.about.updateMany({
        where: { 
          id: existingAbout.id,
          siteId: siteId,
        },
        data: {
          title: data.title,
          content: data.content,
          mission: data.mission,
          vision: data.vision,
          values: data.values,
        },
      })

      if (result.count === 0) {
        return {
          success: false,
          error: 'About record not found or you do not have permission to update it',
        }
      }

      // Fetch the updated record
      about = await db.about.findFirst({
        where: {
          id: existingAbout.id,
          siteId: siteId,
        },
      })!
    } else {
      // Create new record
      about = await db.about.create({
        data: {
          title: data.title,
          content: data.content,
          mission: data.mission,
          vision: data.vision,
          values: data.values,
          siteId: siteId,
        },
      })
    }

    revalidatePath('/admin/about')

    return {
      success: true,
      data: about as About,
    }
  } catch (error) {
    console.error('Error creating/updating about:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save about information',
    }
  }
}

export async function deleteAbout(id: string, siteId: string): Promise<ApiResponse<void>> {
  try {
    const result = await db.about.deleteMany({
      where: { 
        id: id,
        siteId: siteId,
      },
    })

    if (result.count === 0) {
      return {
        success: false,
        error: 'About record not found or you do not have permission to delete it',
      }
    }

    revalidatePath('/admin/about')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error deleting about:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete about information',
    }
  }
} 