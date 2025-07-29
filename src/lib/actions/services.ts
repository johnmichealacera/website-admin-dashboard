'use server'

import { db } from '@/lib/db'
import { ServiceFormData, Service, ApiResponse } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function getServices(siteId: string): Promise<Service[]> {
  try {
    const services = await db.service.findMany({
      where: { siteId },
      orderBy: { createdAt: 'desc' }
    })
    return services
  } catch (error) {
    console.error('Error fetching services:', error)
    return []
  }
}

export async function getService(id: string, siteId: string): Promise<ApiResponse<Service>> {
  try {
    const service = await db.service.findFirst({
      where: { id, siteId }
    })

    if (!service) {
      return { success: false, error: 'Service not found' }
    }

    return { success: true, data: service }
  } catch (error) {
    console.error('Error fetching service:', error)
    return { success: false, error: 'Failed to fetch service' }
  }
}

export async function createService(data: ServiceFormData, siteId: string): Promise<ApiResponse<Service>> {
  try {
    // Generate slug from title
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const service = await db.service.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        category: data.category,
        iconUrl: data.iconUrl,
        isFeatured: data.isFeatured,
        siteId: siteId,
      }
    })

    revalidatePath('/admin/services')
    revalidatePath('/admin')

    return { success: true, data: service }
  } catch (error) {
    console.error('Error creating service:', error)
    return { success: false, error: 'Failed to create service' }
  }
}

export async function updateService(id: string, data: ServiceFormData, siteId: string): Promise<ApiResponse<Service>> {
  try {
    // Generate slug from title
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const service = await db.service.update({
      where: { id, siteId },
      data: {
        title: data.title,
        slug,
        description: data.description,
        category: data.category,
        iconUrl: data.iconUrl,
        isFeatured: data.isFeatured,
      }
    })

    revalidatePath('/admin/services')
    revalidatePath('/admin')

    return { success: true, data: service }
  } catch (error) {
    console.error('Error updating service:', error)
    return { success: false, error: 'Failed to update service' }
  }
}

export async function deleteService(id: string, siteId: string): Promise<ApiResponse<void>> {
  try {
    await db.service.delete({
      where: { id, siteId }
    })

    revalidatePath('/admin/services')
    revalidatePath('/admin')

    return { success: true }
  } catch (error) {
    console.error('Error deleting service:', error)
    return { success: false, error: 'Failed to delete service' }
  }
} 