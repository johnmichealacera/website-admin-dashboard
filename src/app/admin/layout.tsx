import { AdminLayout } from '@/components/admin-layout'
import { ReactNode } from 'react'

interface AdminLayoutWrapperProps {
  children: ReactNode
}

export default function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  return <AdminLayout>{children}</AdminLayout>
} 