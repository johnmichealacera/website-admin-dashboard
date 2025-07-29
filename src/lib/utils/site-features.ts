import { SitePackage, SiteFeature } from '@/lib/types'

export const PACKAGE_FEATURES: Record<SitePackage, SiteFeature[]> = {
  BASIC: [SiteFeature.DASHBOARD, SiteFeature.HERO, SiteFeature.PRODUCTS, SiteFeature.CATEGORIES],
  STANDARD: [SiteFeature.DASHBOARD, SiteFeature.HERO, SiteFeature.PRODUCTS, SiteFeature.CATEGORIES, SiteFeature.EVENTS, SiteFeature.SERVICES],
  PREMIUM: [SiteFeature.DASHBOARD, SiteFeature.HERO, SiteFeature.PRODUCTS, SiteFeature.CATEGORIES, SiteFeature.EVENTS, SiteFeature.EVENT_SERVICES, SiteFeature.ABOUT, SiteFeature.SERVICES, SiteFeature.GALLERY],
  ENTERPRISE: [SiteFeature.DASHBOARD, SiteFeature.HERO, SiteFeature.PRODUCTS, SiteFeature.CATEGORIES, SiteFeature.EVENTS, SiteFeature.EVENT_SERVICES, SiteFeature.ABOUT, SiteFeature.CONTACT, SiteFeature.SERVICES, SiteFeature.GALLERY, SiteFeature.TESTIMONIALS]
}

export function getAvailableFeatures(packageType: SitePackage): SiteFeature[] {
  return PACKAGE_FEATURES[packageType] || []
}

export function isFeatureAvailable(siteFeatures: SiteFeature[], feature: SiteFeature): boolean {
  return siteFeatures.includes(feature)
} 