'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { EventService, EventServiceFormData, ApiResponse } from '@/lib/types'

export async function getEventServices(siteId: string): Promise<ApiResponse<EventService[]>> {
  try {
    const eventServices = await db.eventService.findMany({
      where: {
        siteId: siteId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return {
      success: true,
      data: eventServices.map(service => ({
        ...service,
        addOns: service.addOns ? JSON.parse(JSON.stringify(service.addOns)) : null
      })),
    }
  } catch (error) {
    console.error('Error fetching event services:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch event services',
    }
  }
}

export async function getEventService(id: string, siteId: string): Promise<ApiResponse<EventService>> {
  try {
    const eventService = await db.eventService.findFirst({
      where: {
        id,
        siteId: siteId,
      },
    })

    if (!eventService) {
      return {
        success: false,
        error: 'Event service not found',
      }
    }

    return {
      success: true,
      data: {
        ...eventService,
        addOns: eventService.addOns ? JSON.parse(JSON.stringify(eventService.addOns)) : null
      },
    }
  } catch (error) {
    console.error('Error fetching event service:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch event service',
    }
  }
}

export async function createEventService(data: EventServiceFormData): Promise<ApiResponse<EventService>> {
  try {
    console.log('createEventService data', data)
    const eventService = await db.eventService.create({
      data: {
        ...data,
        addOns: data.addOns ? JSON.parse(JSON.stringify(data.addOns)) : null,
      },
    })

    revalidatePath('/admin/event-services')

    return {
      success: true,
      data: {
        ...eventService,
        addOns: eventService.addOns ? JSON.parse(JSON.stringify(eventService.addOns)) : null
      },
    }
  } catch (error) {
    console.error('Error creating event service:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create event service',
    }
  }
}

export async function updateEventService(id: string, data: EventServiceFormData, siteId: string): Promise<ApiResponse<EventService>> {
  try {
    const eventService = await db.eventService.updateMany({
      where: {
        id,
        siteId: siteId,
      },
      data: {
        ...data,
        addOns: data.addOns ? JSON.parse(JSON.stringify(data.addOns)) : null,
      },
    })

    if (eventService.count === 0) {
      return {
        success: false,
        error: 'Event service not found or you do not have permission to update it',
      }
    }

    // Fetch the updated event service
    const updatedEventService = await db.eventService.findFirst({
      where: {
        id,
        siteId: siteId,
      },
    })

    revalidatePath('/admin/event-services')

    return {
      success: true,
      data: {
        ...updatedEventService!,
        addOns: updatedEventService!.addOns ? JSON.parse(JSON.stringify(updatedEventService!.addOns)) : null
      },
    }
  } catch (error) {
    console.error('Error updating event service:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update event service',
    }
  }
}

export async function deleteEventService(id: string, siteId: string): Promise<ApiResponse<void>> {
  try {
    const result = await db.eventService.deleteMany({
      where: {
        id,
        siteId: siteId,
      },
    })

    if (result.count === 0) {
      return {
        success: false,
        error: 'Event service not found or you do not have permission to delete it',
      }
    }

    revalidatePath('/admin/event-services')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error deleting event service:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete event service',
    }
  }
}

export async function toggleEventServiceStatus(id: string, siteId: string): Promise<ApiResponse<EventService>> {
  try {
    // First get the current status
    const eventService = await db.eventService.findFirst({
      where: {
        id,
        siteId: siteId,
      },
    })

    if (!eventService) {
      return {
        success: false,
        error: 'Event service not found',
      }
    }

    // Toggle the status
    const updatedEventService = await db.eventService.update({
      where: {
        id,
      },
      data: {
        isActive: !eventService.isActive,
      },
    })

    revalidatePath('/admin/event-services')

    return {
      success: true,
      data: {
        ...updatedEventService,
        addOns: updatedEventService.addOns ? JSON.parse(JSON.stringify(updatedEventService.addOns)) : null
      },
    }
  } catch (error) {
    console.error('Error toggling event service status:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to toggle event service status',
    }
  }
}

export async function getEventServicesStats(siteId: string) {
  try {
    const [totalServices, activeServices, featuredServices] = await Promise.all([
      db.eventService.count({
        where: { siteId: siteId }
      }),
      db.eventService.count({
        where: { siteId: siteId, isActive: true }
      }),
      db.eventService.count({
        where: { siteId: siteId, isFeatured: true }
      })
    ])

    return {
      success: true,
      data: {
        totalServices,
        activeServices,
        featuredServices
      }
    }
  } catch (error) {
    console.error('Error fetching event services stats:', error)
    return {
      success: false,
      error: 'Failed to fetch event services stats'
    }
  }
} 