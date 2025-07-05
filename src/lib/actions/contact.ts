'use server'

import { db } from '@/lib/db'
import { ContactFormData, ApiResponse, Contact } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function getContact(): Promise<Contact | null> {
  try {
    const contact = await db.contact.findFirst({
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

export async function createOrUpdateContact(data: ContactFormData): Promise<ApiResponse<Contact>> {
  try {
    // First check if contact record exists
    const existingContact = await db.contact.findFirst()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let contact: any;

    if (existingContact) {
      // Update existing record
      contact = await db.contact.update({
        where: { id: existingContact.id },
        data: {
          businessName: data.businessName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
          socialLinks: data.socialLinks as Record<string, string>,
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
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
          socialLinks: data.socialLinks as Record<string, string>,
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

export async function deleteContact(id: string): Promise<ApiResponse<null>> {
  try {
    await db.contact.delete({
      where: { id },
    })

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