// Base model types (matching Prisma schema)
export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  imageUrls: string[]
  isActive: boolean
  categoryId: string
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  description: string | null
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
  state: string | null
  zipCode: string | null
  country: string | null
  socialLinks: Record<string, string> | null // JSON type for social media links
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

// Form types
export type ProductFormData = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>

export type CategoryFormData = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>

export type AboutFormData = Omit<About, 'id' | 'createdAt' | 'updatedAt'>

export type ContactFormData = Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>

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

// Dashboard stats
export interface DashboardStats {
  totalProducts: number
  totalCategories: number
  lowStockItems: number
  totalValue: number
} 