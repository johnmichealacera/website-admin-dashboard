'use client'

import { useUser } from '@auth0/nextjs-auth0'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HomePage() {
  const { user, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push('/admin')
      } else {
        router.push('/login')
      }
    }
  }, [user, isLoading, router])

  // Show loading state while checking authentication
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
        
        {/* Hero Component Demo Link */}
        <div className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">Want to see the new Hero component?</p>
          <a 
            href="/demo" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Hero Section Demo
          </a>
        </div>
      </div>
    </div>
  )
}
