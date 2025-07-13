'use server'

import { db } from '@/lib/db'
import { EventFormData, Event, ApiResponse } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function getEvents(siteId: string): Promise<Event[]> {
  try {
    const events = await db.event.findMany({
      where: {
        siteId: siteId,
      },
      orderBy: {
        startDate: 'asc',
      },
    })
    return events
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

export async function getEventById(id: string, siteId: string): Promise<Event | null> {
  try {
    const event = await db.event.findFirst({
      where: {
        id: id,
        siteId: siteId,
      },
    })
    return event
  } catch (error) {
    console.error('Error fetching event:', error)
    return null
  }
}

export async function createEvent(data: EventFormData, siteId: string): Promise<ApiResponse<Event>> {
  try {
    const event = await db.event.create({
      data: {
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        location: data.location,
        address: data.address,
        city: data.city,
        province: data.province,
        zipCode: data.zipCode,
        country: data.country,
        price: data.price,
        maxAttendees: data.maxAttendees,
        imageUrls: data.imageUrls,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        tags: data.tags,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        websiteUrl: data.websiteUrl,
        siteId: siteId,
      },
    })

    revalidatePath('/admin/events')
    revalidatePath('/admin')

    return {
      success: true,
      data: event,
    }
  } catch (error) {
    console.error('Error creating event:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create event',
    }
  }
}

export async function updateEvent(id: string, data: Partial<EventFormData>, siteId: string): Promise<ApiResponse<Event>> {
  try {
    const event = await db.event.updateMany({
      where: {
        id: id,
        siteId: siteId,
      },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.startDate && { startDate: data.startDate }),
        ...(data.endDate !== undefined && { endDate: data.endDate }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.province !== undefined && { province: data.province }),
        ...(data.zipCode !== undefined && { zipCode: data.zipCode }),
        ...(data.country !== undefined && { country: data.country }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.maxAttendees !== undefined && { maxAttendees: data.maxAttendees }),
        ...(data.imageUrls !== undefined && { imageUrls: data.imageUrls }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
        ...(data.tags !== undefined && { tags: data.tags }),
        ...(data.contactEmail !== undefined && { contactEmail: data.contactEmail }),
        ...(data.contactPhone !== undefined && { contactPhone: data.contactPhone }),
        ...(data.websiteUrl !== undefined && { websiteUrl: data.websiteUrl }),
      },
    })

    if (event.count === 0) {
      return {
        success: false,
        error: 'Event not found or you do not have permission to update it',
      }
    }

    // Fetch the updated event to return
    const updatedEvent = await db.event.findFirst({
      where: {
        id: id,
        siteId: siteId,
      },
    })

    revalidatePath('/admin/events')
    revalidatePath('/admin')

    return {
      success: true,
      data: updatedEvent!,
    }
  } catch (error) {
    console.error('Error updating event:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update event',
    }
  }
}

export async function deleteEvent(id: string, siteId: string): Promise<ApiResponse<void>> {
  try {
    const result = await db.event.deleteMany({
      where: {
        id: id,
        siteId: siteId,
      },
    })

    if (result.count === 0) {
      return {
        success: false,
        error: 'Event not found or you do not have permission to delete it',
      }
    }

    revalidatePath('/admin/events')
    revalidatePath('/admin')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error deleting event:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete event',
    }
  }
}

export async function getFeaturedEvents(siteId: string): Promise<Event[]> {
  try {
    const events = await db.event.findMany({
      where: {
        siteId: siteId,
        isFeatured: true,
        isActive: true,
      },
      orderBy: {
        startDate: 'asc',
      },
    })
    return events
  } catch (error) {
    console.error('Error fetching featured events:', error)
    return []
  }
}

export async function getUpcomingEvents(siteId: string): Promise<Event[]> {
  try {
    const events = await db.event.findMany({
      where: {
        siteId: siteId,
        startDate: {
          gte: new Date(),
        },
        isActive: true,
      },
      orderBy: {
        startDate: 'asc',
      },
    })
    return events
  } catch (error) {
    console.error('Error fetching upcoming events:', error)
    return []
  }
} 