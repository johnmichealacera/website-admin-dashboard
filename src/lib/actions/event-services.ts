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
      include: {
        servicePackages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
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
        addOns: eventService.addOns ? JSON.parse(JSON.stringify(eventService.addOns)) : null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        servicePackages: eventService.servicePackages?.map((pkg: any) => ({
          ...pkg,
          addOns: pkg.addOns ? JSON.parse(JSON.stringify(pkg.addOns)) : null
        })) || []
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
    
    // Extract packages data from the form data
    const { servicePackages, ...eventServiceData } = data
    
    // First create the event service
    const eventService = await db.eventService.create({
      data: {
        ...eventServiceData,
        addOns: eventServiceData.addOns ? JSON.parse(JSON.stringify(eventServiceData.addOns)) : null,
      },
    })

    // Then create packages if provided
    if (servicePackages && servicePackages.length > 0) {
      await db.eventServicePackage.createMany({
        data: servicePackages.map(pkg => ({
          name: pkg.name,
          description: pkg.description,
          price: pkg.price,
          inclusions: pkg.inclusions,
          addOns: pkg.addOns ? JSON.parse(JSON.stringify(pkg.addOns)) : null,
          freebies: pkg.freebies,
          isActive: pkg.isActive,
          sortOrder: pkg.sortOrder || 0,
          colorHexCode: pkg.colorHexCode || "#3B82F6",
          eventServiceId: eventService.id
        }))
      })
    }

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
    // Extract packages data from the form data
    const { servicePackages, ...eventServiceData } = data
    
    const eventService = await db.eventService.updateMany({
      where: {
        id,
        siteId: siteId,
      },
      data: {
        ...eventServiceData,
        addOns: eventServiceData.addOns ? JSON.parse(JSON.stringify(eventServiceData.addOns)) : null,
      },
    })

    if (eventService.count === 0) {
      return {
        success: false,
        error: 'Event service not found or you do not have permission to update it',
      }
    }

    // Update packages if provided
    if (servicePackages) {
      // Delete existing packages
      await db.eventServicePackage.deleteMany({
        where: {
          eventServiceId: id,
        },
      })

      // Create new packages
      if (servicePackages.length > 0) {
        await db.eventServicePackage.createMany({
          data: servicePackages.map(pkg => ({
            name: pkg.name,
            description: pkg.description,
            price: pkg.price,
            inclusions: pkg.inclusions,
            addOns: pkg.addOns ? JSON.parse(JSON.stringify(pkg.addOns)) : null,
            freebies: pkg.freebies,
            isActive: pkg.isActive,
            sortOrder: pkg.sortOrder || 0,
            colorHexCode: pkg.colorHexCode || "#3B82F6",
            eventServiceId: id
          }))
        })
      }
    }

    // Fetch the updated event service with packages
    const updatedEventService = await db.eventService.findFirst({
      where: {
        id,
        siteId: siteId,
      },
      include: {
        servicePackages: true
      }
    })

    revalidatePath('/admin/event-services')

    return {
      success: true,
      data: {
        ...updatedEventService!,
        addOns: updatedEventService!.addOns ? JSON.parse(JSON.stringify(updatedEventService!.addOns)) : null,
        servicePackages: updatedEventService!.servicePackages?.map((pkg) => ({
          ...pkg,
          addOns: pkg.addOns ? JSON.parse(JSON.stringify(pkg.addOns)) : null
        })) || []
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