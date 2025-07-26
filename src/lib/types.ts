// Enums
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN'
}


export interface SitePackageInfo {
  id: string
  name: string
  domain?: string
  logoUrl?: string | null
  packageType?: SitePackage
  features?: SiteFeatureData[]
  featuresOrder?: SiteFeature[]
  colorPalette?: string[]
  googleAnalyticsTag?: string | null
  isActive?: boolean
  updatedAt: Date
  _count?: {
    users: number
    products: number
    categories: number
    events: number
  }
}

export enum SiteRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER'
}

export enum SitePackage {
  BASIC = 'BASIC',
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE'
}

export enum SiteFeature {
  DASHBOARD = 'DASHBOARD',
  HERO = 'HERO',
  PRODUCTS = 'PRODUCTS',
  CATEGORIES = 'CATEGORIES',
  EVENTS = 'EVENTS',
  EVENT_SERVICES = 'EVENT_SERVICES',
  ABOUT = 'ABOUT',
  CONTACT = 'CONTACT'
}

// Hero model type
export interface Hero {
  id: string
  title: string | null
  subtitle: string | null
  description: string | null
  imageUrl: string | null
  videoUrl: string | null
  ctaButton: string | null
  ctaLink: string | null
  siteId: string
  createdAt: Date
  updatedAt: Date
}

// Multi-tenant model types
export interface Site {
  id: string
  name: string
  domain: string
  subdomain: string | null
  description: string | null
  logoUrl: string | null
  googleAnalyticsTag: string | null
  isActive: boolean
  packageType: SitePackage
  features: SiteFeatureData[]
  featuresOrder: SiteFeature[]
  colorPalette: string[]
  hero?: Hero | null
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  email: string
  auth0UserId: string
  name: string | null
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserSite {
  id: string
  userId: string
  siteId: string
  role: SiteRole
  user?: User
  site?: Site
}

// Base model types (updated with siteId)
export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  imageUrls: string[]
  isActive: boolean
  categoryId: string
  siteId: string
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  description: string | null
  siteId: string
  createdAt: Date
  updatedAt: Date
}

export interface About {
  id: string
  title: string
  content: string
  mission: string | null
  vision: string | null
  values: string[]
  siteId: string
  createdAt: Date
  updatedAt: Date
}

export interface Contact {
  id: string
  businessName: string
  email: string
  phone: string | null
  address: string | null
  city: string | null
  province: string | null
  zipCode: string | null
  country: string | null
  socialLinks: Record<string, string> | null // JSON type for social media links
  siteId: string
  createdAt: Date
  updatedAt: Date
}

export interface Event {
  id: string
  title: string
  description: string | null
  startDate: Date
  endDate: Date | null
  location: string | null
  address: string | null
  city: string | null
  province: string | null
  zipCode: string | null
  country: string | null
  price: number | null
  maxAttendees: number | null
  imageUrls: string[]
  isActive: boolean
  isFeatured: boolean
  isConfirmed: boolean
  tags: string[]
  contactEmail: string | null
  contactPhone: string | null
  contactName: string | null
  siteId: string
  eventServicePackageId: string | null
  createdAt: Date
  updatedAt: Date
  eventServicePackage?: EventServicePackage | null
}

export interface EventService {
  id: string
  name: string
  description: string | null
  basePrice: number | null
  isActive: boolean
  isFeatured: boolean
  packages: string[]
  duration: string | null
  inclusions: string[]
  addOns: EventServiceAddOn[] | null
  freebies: string[]
  contactEmail: string | null
  contactPhone: string | null
  bookingUrl: string | null
  tags: string[]
  bgImage: string | null
  siteId: string
  createdAt: Date
  updatedAt: Date
  servicePackages?: EventServicePackage[]
}

export interface EventServicePackage {
  id: string
  name: string
  description: string | null
  price: number | null
  inclusions: string[]
  addOns: EventServiceAddOn[] | null
  freebies: string[]
  isActive: boolean
  sortOrder: number
  colorHexCode: string | null
  eventServiceId: string
  createdAt: Date
  updatedAt: Date
  eventService?: {
    id: string
    name: string
  }
}

export interface EventServiceAddOn {
  name: string
  price: number
  description?: string
}

// Extended types with relations
export type ProductWithCategory = Product & {
  category: Category
}

export type CategoryWithProducts = Category & {
  products: Product[]
}

export type SiteWithUsers = Site & {
  users: UserSite[]
}

export type UserWithSites = User & {
  sites: UserSite[]
}

// Form types
export type ProductFormData = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>

export type CategoryFormData = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>

export type AboutFormData = Omit<About, 'id' | 'createdAt' | 'updatedAt'>

export type ContactFormData = Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>

export type EventFormData = Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'eventServicePackage'> & {
  eventServicePackageId?: string | null
}

export type EventServiceFormData = Omit<EventService, 'id' | 'createdAt' | 'updatedAt' | 'imageUrls' | 'servicePackages'> & {
  servicePackages?: Omit<EventServicePackage, 'id' | 'createdAt' | 'updatedAt' | 'eventServiceId'>[]
}

export type SiteFormData = Omit<Site, 'id' | 'createdAt' | 'updatedAt'>

// Client Site Settings Types (for regular admins)
export interface SiteFeatureData {
  siteId: string;
  name: FeatureName;
  description: string;
  zcalLink?: string;
  zcalEnabled?: boolean;
}

export interface ClientSiteSettingsData {
  name: string;
  description: string | null;
  googleAnalyticsTag: string | null;
  features: SiteFeatureData[];
  featuresOrder: FeatureName[];
  colorPalette: string[];
}

export interface ClientSiteUpdateData {
  siteId: string;
  name: string;
  description: string | null;
  googleAnalyticsTag: string | null;
  features: SiteFeatureData[];
  featuresOrder: FeatureName[];
  colorPalette: string[];
}

export type UserFormData = Omit<User, 'id' | 'createdAt' | 'updatedAt'>

// Multi-tenant context types
export interface TenantContext {
  currentSite: Site | null
  userSites: UserSite[]
  currentUser: User | null
  switchSite: (siteId: string) => void
}

// Site package form data types
export interface SitePackageFormData {
  packageType: SitePackage
  features: SiteFeatureData[]
}

export interface SitePackageUpdateData {
  siteId: string
  packageType: SitePackage
  features: SiteFeatureData[]
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Dashboard stats (updated for multi-tenant)
export interface DashboardStats {
  totalProducts: number
  totalCategories: number
  lowStockItems: number
  totalValue: number
  siteName: string
} 

// Temporary alias for feature name type
export type FeatureName = SiteFeature; 