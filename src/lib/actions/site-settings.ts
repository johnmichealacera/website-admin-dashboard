'use server'

import { db } from '@/lib/db'
import { SitePackageUpdateData, SitePackageInfo, ClientSiteUpdateData, SiteFeature } from '@/lib/types'
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
        logoUrl: true,
        packageType: true,
        features: true,
        updatedAt: true
      }
    })

    if (!site) {
      return { success: false, error: 'Site not found' }
    }

    return { success: true, site: site as SitePackageInfo }
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
        logoUrl: true,
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

export async function updateSiteLogo(siteId: string, logoUrl: string | null) {
  try {
    const updatedSite = await db.site.update({
      where: { id: siteId },
      data: {
        logoUrl: logoUrl,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        packageType: true,
        features: true,
        updatedAt: true
      }
    })

    revalidatePath('/admin/settings')
    return { success: true, site: updatedSite as SitePackageInfo }
  } catch (error) {
    console.error('Error updating site logo:', error)
    return { success: false, error: 'Failed to update site logo' }
  }
}

// Client Site Settings Actions (for regular admins)
export async function updateClientSiteSettings(data: ClientSiteUpdateData) {
  try {
    // Get the current site to check package limits
    const currentSite = await db.site.findUnique({
      where: { id: data.siteId },
      select: { packageType: true }
    })

    if (!currentSite) {
      return { success: false, error: 'Site not found' }
    }

    // Define package limits
    const packageLimits = {
      BASIC: { min: 1, max: 3 },
      STANDARD: { min: 4, max: 6 },
      PREMIUM: { min: 4, max: 6 },
      ENTERPRISE: { min: 1, max: 6 }
    }

    const limits = packageLimits[currentSite.packageType as keyof typeof packageLimits]
    const nonDashboardFeatures = data.features.filter(f => f !== SiteFeature.DASHBOARD)
    
    // Validate feature count based on package
    if (nonDashboardFeatures.length < limits.min) {
      return { success: false, error: `Please select at least ${limits.min} feature${limits.min !== 1 ? 's' : ''} for your ${currentSite.packageType.toLowerCase()} package` }
    }
    
    if (nonDashboardFeatures.length > limits.max) {
      return { success: false, error: `You can select maximum ${limits.max} features for your ${currentSite.packageType.toLowerCase()} package` }
    }

    // Ensure DASHBOARD is always included and first in both arrays
    const features = [SiteFeature.DASHBOARD, ...nonDashboardFeatures]
    const featuresOrder = [SiteFeature.DASHBOARD, ...data.featuresOrder.filter(f => f !== SiteFeature.DASHBOARD)]

    const updatedSite = await db.site.update({
      where: { id: data.siteId },
      data: {
        name: data.name.trim(),
        features: features,
        featuresOrder: featuresOrder,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        features: true,
        featuresOrder: true,
        packageType: true,
        updatedAt: true
      }
    })

    revalidatePath('/admin/site-settings')
    revalidatePath('/admin')
    return { success: true, site: updatedSite }
  } catch (error) {
    console.error('Error updating client site settings:', error)
    return { success: false, error: 'Failed to update site settings' }
  }
}

export async function getClientSiteSettings(siteId: string) {
  try {
    const site = await db.site.findUnique({
      where: { id: siteId },
      select: {
        id: true,
        name: true,
        features: true,
        featuresOrder: true,
        packageType: true,
        updatedAt: true
      }
    })

    if (!site) {
      return { success: false, error: 'Site not found' }
    }

    // Convert to proper types
    const siteData = {
      id: site.id,
      name: site.name,
      features: site.features as SiteFeature[],
      featuresOrder: site.featuresOrder as SiteFeature[],
      packageType: site.packageType,
      updatedAt: site.updatedAt
    }

    return { success: true, site: siteData }
  } catch (error) {
    console.error('Error fetching client site settings:', error)
    return { success: false, error: 'Failed to fetch site settings' }
  }
}