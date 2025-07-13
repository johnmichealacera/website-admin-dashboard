// Enums
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN'
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
  PRODUCTS = 'PRODUCTS',
  CATEGORIES = 'CATEGORIES',
  EVENTS = 'EVENTS',
  ABOUT = 'ABOUT',
  CONTACT = 'CONTACT'
}

// Multi-tenant model types
export interface Site {
  id: string
  name: string
  domain: string
  subdomain: string | null
  description: string | null
  isActive: boolean
  packageType: SitePackage
  features: SiteFeature[]
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
  tags: string[]
  contactEmail: string | null
  contactPhone: string | null
  websiteUrl: string | null
  siteId: string
  createdAt: Date
  updatedAt: Date
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

export type EventFormData = Omit<Event, 'id' | 'createdAt' | 'updatedAt'>

export type SiteFormData = Omit<Site, 'id' | 'createdAt' | 'updatedAt'>

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
  features: SiteFeature[]
}

export interface SitePackageUpdateData {
  siteId: string
  packageType: SitePackage
  features: SiteFeature[]
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