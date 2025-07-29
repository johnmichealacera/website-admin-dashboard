'use server'

import { db } from '@/lib/db'
import { TestimonialFormData, Testimonial, ApiResponse } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function getTestimonials(siteId: string): Promise<Testimonial[]> {
  try {
    const testimonials = await db.testimonial.findMany({
      where: { siteId },
      orderBy: { createdAt: 'desc' }
    })
    return testimonials
  } catch (error) {
    console.error('Error fetching testimonials:', error)
    return []
  }
}

export async function getTestimonial(id: string, siteId: string): Promise<ApiResponse<Testimonial>> {
  try {
    const testimonial = await db.testimonial.findFirst({
      where: { id, siteId }
    })

    if (!testimonial) {
      return { success: false, error: 'Testimonial not found' }
    }

    return { success: true, data: testimonial }
  } catch (error) {
    console.error('Error fetching testimonial:', error)
    return { success: false, error: 'Failed to fetch testimonial' }
  }
}

export async function createTestimonial(data: TestimonialFormData, siteId: string): Promise<ApiResponse<Testimonial>> {
  try {
    const testimonial = await db.testimonial.create({
      data: {
        clientName: data.clientName,
        clientTitle: data.clientTitle,
        content: data.content,
        rating: data.rating,
        avatarUrl: data.avatarUrl,
        projectId: data.projectId,
        siteId: siteId,
      }
    })

    revalidatePath('/admin/testimonials')
    revalidatePath('/admin')

    return { success: true, data: testimonial }
  } catch (error) {
    console.error('Error creating testimonial:', error)
    return { success: false, error: 'Failed to create testimonial' }
  }
}

export async function updateTestimonial(id: string, data: TestimonialFormData, siteId: string): Promise<ApiResponse<Testimonial>> {
  try {
    const testimonial = await db.testimonial.update({
      where: { id, siteId },
      data: {
        clientName: data.clientName,
        clientTitle: data.clientTitle,
        content: data.content,
        rating: data.rating,
        avatarUrl: data.avatarUrl,
        projectId: data.projectId,
      }
    })

    revalidatePath('/admin/testimonials')
    revalidatePath('/admin')

    return { success: true, data: testimonial }
  } catch (error) {
    console.error('Error updating testimonial:', error)
    return { success: false, error: 'Failed to update testimonial' }
  }
}

export async function deleteTestimonial(id: string, siteId: string): Promise<ApiResponse<void>> {
  try {
    await db.testimonial.delete({
      where: { id, siteId }
    })

    revalidatePath('/admin/testimonials')
    revalidatePath('/admin')

    return { success: true }
  } catch (error) {
    console.error('Error deleting testimonial:', error)
    return { success: false, error: 'Failed to delete testimonial' }
  }
} 