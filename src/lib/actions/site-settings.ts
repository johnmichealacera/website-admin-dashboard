'use server'

import { db } from '@/lib/db'
import { SitePackageUpdateData } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function updateSitePackage(data: SitePackageUpdateData) {
  try {
    const updatedSite = await db.site.update({
      where: { id: data.siteId },
      data: {
        packageType: data.packageType,
        features: data.features,
        updatedAt: new Date()
      }
    })

    revalidatePath('/admin/settings')
    return { success: true, site: updatedSite }
  } catch (error) {
    console.error('Error updating site package:', error)
    return { success: false, error: 'Failed to update site package' }
  }
}

export async function getSitePackageInfo(siteId: string) {
  try {
    const site = await db.site.findUnique({
      where: { id: siteId },
      select: {
        id: true,
        name: true,
        packageType: true,
        features: true,
        updatedAt: true
      }
    })

    if (!site) {
      return { success: false, error: 'Site not found' }
    }

    return { success: true, site }
  } catch (error) {
    console.error('Error fetching site package info:', error)
    return { success: false, error: 'Failed to fetch site package info' }
  }
}

export async function getAllSitesPackageInfo() {
  try {
    const sites = await db.site.findMany({
      select: {
        id: true,
        name: true,
        domain: true,
        packageType: true,
        features: true,
        isActive: true,
        updatedAt: true,
        _count: {
          select: {
            users: true,
            products: true,
            categories: true,
            events: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return { success: true, sites }
  } catch (error) {
    console.error('Error fetching all sites package info:', error)
    return { success: false, error: 'Failed to fetch sites package info' }
  }
}