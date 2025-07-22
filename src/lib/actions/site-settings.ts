'use server'

import { db } from '@/lib/db'
import { SitePackageUpdateData, SitePackageInfo, ClientSiteUpdateData, FeatureName, SiteFeature, SiteFeatureData } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function updateSitePackage(data: SitePackageUpdateData) {
  try {
    // Remove all old features for this site
    await db.siteFeature.deleteMany({ where: { siteId: data.siteId } });
    // Add new features
    await db.siteFeature.createMany({
      data: data.features.map((feature: { name: string, description?: string }) => ({
        siteId: data.siteId,
        name: feature.name as FeatureName,
        description: feature.description || null,
      }))
    });
    // Update the site (other fields)
    const updatedSite = await db.site.update({
      where: { id: data.siteId },
      data: {
        packageType: data.packageType,
        updatedAt: new Date()
      }
    });
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
        googleAnalyticsTag: true,
        features: { select: { name: true, description: true } },
        updatedAt: true
      }
    });
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
        features: { select: { name: true, description: true } },
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
    });
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
        features: { select: { name: true, description: true } },
        updatedAt: true
      }
    });
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
    });
    if (!currentSite) {
      return { success: false, error: 'Site not found' }
    }
    // Define package limits
    const packageLimits = {
      BASIC: { min: 1, max: 3 },
      STANDARD: { min: 4, max: 6 },
      PREMIUM: { min: 4, max: 6 },
      ENTERPRISE: { min: 1, max: 6 }
    };
    const limits = packageLimits[currentSite.packageType as keyof typeof packageLimits];
    const nonDashboardFeatures = data.features.filter(f => f.name !== 'DASHBOARD');
    // Validate feature count based on package
    if (nonDashboardFeatures.length < limits.min) {
      return { success: false, error: `Please select at least ${limits.min} feature${limits.min !== 1 ? 's' : ''} for your ${currentSite.packageType.toLowerCase()} package` }
    }
    if (nonDashboardFeatures.length > limits.max) {
      return { success: false, error: `You can select maximum ${limits.max} features for your ${currentSite.packageType.toLowerCase()} package` }
    }
    // Validate color palette (should have exactly 3 colors)
    if (data.colorPalette.length !== 3) {
      return { success: false, error: 'Color palette must have exactly 3 colors' }
    }
    // Validate hex color format
    const hexColorRegex = /^#[0-9A-F]{6}$/i;
    const invalidColors = data.colorPalette.filter(color => !hexColorRegex.test(color));
    if (invalidColors.length > 0) {
      return { success: false, error: 'All colors must be valid hex colors (e.g., #FF0000)' }
    }
    // Ensure DASHBOARD is always included and first in both arrays
    const features: SiteFeatureData[] = [
      { siteId: data.siteId, name: SiteFeature.DASHBOARD, description: data.features.find(f => f.name === SiteFeature.DASHBOARD)?.description || '' },
      ...nonDashboardFeatures
    ];
    const featuresOrder: FeatureName[] = [
      SiteFeature.DASHBOARD,
      ...data.featuresOrder.filter(f => f !== SiteFeature.DASHBOARD)
    ];
    // Remove all old features for this site
    await db.siteFeature.deleteMany({ where: { siteId: data.siteId } });
    // Add new features
    await db.siteFeature.createMany({
      data: features.map((feature: { name: string, description?: string }) => ({
        siteId: data.siteId,
        name: feature.name as FeatureName,
        description: feature.description || undefined,
      }))
    });
    // Update the site (other fields)
    const updatedSite = await db.site.update({
      where: { id: data.siteId },
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        googleAnalyticsTag: data.googleAnalyticsTag?.trim() || null,
        featuresOrder: featuresOrder,
        colorPalette: data.colorPalette,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        description: true,
        googleAnalyticsTag: true,
        featuresOrder: true,
        colorPalette: true,
        packageType: true,
        updatedAt: true
      }
    });
    revalidatePath('/admin/site-settings');
    revalidatePath('/admin');
    return { success: true, site: updatedSite };
  } catch (error) {
    console.error('Error updating client site settings:', error);
    return { success: false, error: 'Failed to update site settings' };
  }
}

export async function getClientSiteSettings(siteId: string) {
  try {
    const site = await db.site.findUnique({
      where: { id: siteId },
      select: {
        id: true,
        name: true,
        description: true,
        googleAnalyticsTag: true,
        features: { select: { siteId: true, name: true, description: true } },
        featuresOrder: true,
        colorPalette: true,
        packageType: true,
        updatedAt: true
      }
    });
    if (!site) {
      return { success: false, error: 'Site not found' }
    }
    // Convert to proper types
    const siteData = {
      id: site.id,
      name: site.name,
      description: site.description,
      googleAnalyticsTag: site.googleAnalyticsTag,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      features: site.features.map((f: any) => ({ siteId: site.id, name: f.name, description: f.description })),
      featuresOrder: site.featuresOrder,
      colorPalette: site.colorPalette,
      packageType: site.packageType,
      updatedAt: site.updatedAt
    };
    return { success: true, site: siteData };
  } catch (error) {
    console.error('Error fetching client site settings:', error);
    return { success: false, error: 'Failed to fetch site settings' };
  }
}

export async function updateGoogleAnalyticsTag(siteId: string, googleAnalyticsTag: string | null) {
  try {
    const updatedSite = await db.site.update({
      where: { id: siteId },
      data: {
        googleAnalyticsTag: googleAnalyticsTag,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        googleAnalyticsTag: true,
        updatedAt: true
      }
    });
    revalidatePath('/admin/site-settings')
    revalidatePath('/admin')
    return { success: true, site: updatedSite }
  } catch (error) {
    console.error('Error updating Google Analytics tag:', error)
    return { success: false, error: 'Failed to update Google Analytics tag' }
  }
}