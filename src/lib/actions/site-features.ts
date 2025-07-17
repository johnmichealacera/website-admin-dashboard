'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { SiteFeature, SiteFeatureData, ApiResponse } from '@/lib/types'

export async function getSiteFeatureDescription(siteId: string, featureName: SiteFeature) {
  try {
    const feature = await db.siteFeature.findUnique({
      where: { siteId_name: { siteId, name: featureName } },
      select: { description: true }
    });
    return { success: true, description: feature?.description || '' };
  } catch (error) {
    console.error('Error fetching feature description:', error);
    return { success: false, error: 'Failed to fetch feature description' };
  }
}

export async function updateSiteFeatureDescription(siteId: string, featureName: SiteFeature, description: string) {
  try {
    const updated = await db.siteFeature.upsert({
      where: { siteId_name: { siteId, name: featureName } },
      update: { description },
      create: { siteId, name: featureName, description },
    });
    return { success: true, description: updated.description };
  } catch (error) {
    console.error('Error updating feature description:', error);
    return { success: false, error: 'Failed to update feature description' };
  }
}

export async function getSiteFeature(siteId: string, featureName: SiteFeature): Promise<ApiResponse<SiteFeatureData>> {
  try {
    const siteFeature = await db.siteFeature.findFirst({
      where: {
        siteId,
        name: featureName,
      },
    })

    if (!siteFeature) {
      return {
        success: false,
        error: 'Site feature not found',
      }
    }

    return {
      success: true,
      data: {
        siteId: siteFeature.siteId,
        name: siteFeature.name as SiteFeature,
        description: siteFeature.description || '',
        zcalLink: siteFeature.zcalLink || undefined,
        zcalEnabled: siteFeature.zcalEnabled || false,
      },
    }
  } catch (error) {
    console.error('Error fetching site feature:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch site feature',
    }
  }
}

export async function updateSiteFeatureZcal(
  siteId: string, 
  featureName: SiteFeature, 
  zcalLink: string | null, 
  zcalEnabled: boolean
): Promise<ApiResponse<SiteFeatureData>> {
  try {
    const siteFeature = await db.siteFeature.upsert({
      where: {
        siteId_name: {
          siteId,
          name: featureName,
        },
      },
      update: {
        zcalLink,
        zcalEnabled,
      },
      create: {
        siteId,
        name: featureName,
        description: '',
        zcalLink,
        zcalEnabled,
      },
    })

    revalidatePath('/admin/event-services')

    return {
      success: true,
      data: {
        siteId: siteFeature.siteId,
        name: siteFeature.name as SiteFeature,
        description: siteFeature.description || '',
        zcalLink: siteFeature.zcalLink || undefined,
        zcalEnabled: siteFeature.zcalEnabled || false,
      },
    }
  } catch (error) {
    console.error('Error updating site feature Zcal settings:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update Zcal settings',
    }
  }
}

export async function getSiteFeatures(siteId: string): Promise<ApiResponse<SiteFeatureData[]>> {
  try {
    const siteFeatures = await db.siteFeature.findMany({
      where: {
        siteId,
      },
    })

    return {
      success: true,
      data: siteFeatures.map(feature => ({
        siteId: feature.siteId,
        name: feature.name as SiteFeature,
        description: feature.description || '',
        zcalLink: feature.zcalLink || undefined,
        zcalEnabled: feature.zcalEnabled || false,
      })),
    }
  } catch (error) {
    console.error('Error fetching site features:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch site features',
    }
  }
}

export async function testZcalSettings(siteId: string): Promise<ApiResponse<boolean>> {
  try {
    const response = await getSiteFeature(siteId, SiteFeature.EVENT_SERVICES)
    return {
      success: true,
      data: response.success
    }
  } catch (error) {
    console.error('Error testing Zcal settings:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to test Zcal settings',
    }
  }
} 