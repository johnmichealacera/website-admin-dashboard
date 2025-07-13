'use server'

import { db } from '@/lib/db'
import { ContactFormData, ApiResponse, Contact } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function getContact(siteId: string): Promise<Contact | null> {
  try {
    const contact = await db.contact.findFirst({
      where: {
        siteId: siteId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return contact as Contact;
  } catch (error) {
    console.error('Error fetching contact:', error)
    return null
  }
}

export async function createOrUpdateContact(data: ContactFormData, siteId: string): Promise<ApiResponse<Contact>> {
  try {
    // First check if contact record exists for this site
    const existingContact = await db.contact.findFirst({
      where: {
        siteId: siteId,
      },
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let contact: any;

    if (existingContact) {
      // Update existing record
      const result = await db.contact.updateMany({
        where: { 
          id: existingContact.id,
          siteId: siteId,
        },
        data: {
          businessName: data.businessName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          province: data.province,
          zipCode: data.zipCode,
          country: data.country,
          socialLinks: data.socialLinks as Record<string, string>,
        },
      })

      if (result.count === 0) {
        return {
          success: false,
          error: 'Contact record not found or you do not have permission to update it',
        }
      }

      // Fetch the updated record
      contact = await db.contact.findFirst({
        where: {
          id: existingContact.id,
          siteId: siteId,
        },
      })
    } else {
      // Create new record
      contact = await db.contact.create({
        data: {
          businessName: data.businessName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          province: data.province,
          zipCode: data.zipCode,
          country: data.country,
          socialLinks: data.socialLinks as Record<string, string>,
          siteId: siteId,
        },
      })
    }

    revalidatePath('/admin/contact')

    return {
      success: true,
      data: contact,
    }
  } catch (error) {
    console.error('Error creating/updating contact:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save contact information',
    }
  }
}

export async function deleteContact(id: string, siteId: string): Promise<ApiResponse<void>> {
  try {
    const result = await db.contact.deleteMany({
      where: { 
        id: id,
        siteId: siteId,
      },
    })

    if (result.count === 0) {
      return {
        success: false,
        error: 'Contact record not found or you do not have permission to delete it',
      }
    }

    revalidatePath('/admin/contact')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error deleting contact:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete contact information',
    }
  }
} 