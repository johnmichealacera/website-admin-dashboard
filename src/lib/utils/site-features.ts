import { SitePackage, SiteFeature } from '@/lib/types'

export const PACKAGE_FEATURES: Record<SitePackage, SiteFeature[]> = {
  BASIC: [SiteFeature.DASHBOARD, SiteFeature.HERO, SiteFeature.PRODUCTS, SiteFeature.CATEGORIES],
  STANDARD: [SiteFeature.DASHBOARD, SiteFeature.HERO, SiteFeature.PRODUCTS, SiteFeature.CATEGORIES, SiteFeature.EVENTS],
  PREMIUM: [SiteFeature.DASHBOARD, SiteFeature.HERO, SiteFeature.PRODUCTS, SiteFeature.CATEGORIES, SiteFeature.EVENTS, SiteFeature.EVENT_SERVICES, SiteFeature.ABOUT],
  ENTERPRISE: [SiteFeature.DASHBOARD, SiteFeature.HERO, SiteFeature.PRODUCTS, SiteFeature.CATEGORIES, SiteFeature.EVENTS, SiteFeature.EVENT_SERVICES, SiteFeature.ABOUT, SiteFeature.CONTACT]
}

export function getAvailableFeatures(packageType: SitePackage): SiteFeature[] {
  return PACKAGE_FEATURES[packageType] || []
}

export function isFeatureAvailable(siteFeatures: SiteFeature[], feature: SiteFeature): boolean {
  return siteFeatures.includes(feature)
} 