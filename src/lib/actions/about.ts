'use server'

import { db } from '@/lib/db'
import { AboutFormData, ApiResponse, About } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function getAbout(): Promise<About | null> {
  try {
    const about = await db.about.findFirst({
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

export async function createOrUpdateAbout(data: AboutFormData): Promise<ApiResponse<About>> {
  try {
    // First check if about record exists
    const existingAbout = await db.about.findFirst()

    let about: About

    if (existingAbout) {
      // Update existing record
      about = await db.about.update({
        where: { id: existingAbout.id },
        data: {
          title: data.title,
          content: data.content,
          mission: data.mission,
          vision: data.vision,
          values: data.values,
        },
      })
    } else {
      // Create new record
      about = await db.about.create({
        data: {
          title: data.title,
          content: data.content,
          mission: data.mission,
          vision: data.vision,
          values: data.values,
        },
      })
    }

    revalidatePath('/admin/about')

    return {
      success: true,
      data: about,
    }
  } catch (error) {
    console.error('Error creating/updating about:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save about information',
    }
  }
}

export async function deleteAbout(id: string): Promise<ApiResponse<null>> {
  try {
    await db.about.delete({
      where: { id },
    })

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