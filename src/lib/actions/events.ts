'use server'

import { db } from '@/lib/db'
import { EventFormData, Event, ApiResponse } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function getEvents(): Promise<Event[]> {
  try {
    const events = await db.event.findMany({
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

export async function getEventById(id: string): Promise<Event | null> {
  try {
    const event = await db.event.findUnique({
      where: { id },
    })
    return event
  } catch (error) {
    console.error('Error fetching event:', error)
    return null
  }
}

export async function createEvent(data: EventFormData): Promise<ApiResponse<Event>> {
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

export async function updateEvent(id: string, data: Partial<EventFormData>): Promise<ApiResponse<Event>> {
  try {
    const event = await db.event.update({
      where: { id },
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

    revalidatePath('/admin/events')
    revalidatePath('/admin')

    return {
      success: true,
      data: event,
    }
  } catch (error) {
    console.error('Error updating event:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update event',
    }
  }
}

export async function deleteEvent(id: string): Promise<ApiResponse<null>> {
  try {
    await db.event.delete({
      where: { id },
    })

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

export async function getFeaturedEvents(): Promise<Event[]> {
  try {
    const events = await db.event.findMany({
      where: {
        isFeatured: true,
        isActive: true,
        startDate: {
          gte: new Date(),
        },
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

export async function getUpcomingEvents(): Promise<Event[]> {
  try {
    const events = await db.event.findMany({
      where: {
        isActive: true,
        startDate: {
          gte: new Date(),
        },
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