import { db } from '@/lib/db';
import { FeatureName } from '@/lib/types';

export async function getSiteFeatureDescription(siteId: string, featureName: FeatureName) {
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

export async function updateSiteFeatureDescription(siteId: string, featureName: FeatureName, description: string) {
  try {
    const updated = await db.siteFeature.upsert({
      where: { siteId_name: { siteId, name: featureName } },
      update: { description },
      create: { siteId, name: featureName, description },
    });
    return { success: true, description: updated.description };
  } catch (error) {
    console.error('Error fetching feature description:', error);

    return { success: false, error: 'Failed to update feature description' };
  }
} 