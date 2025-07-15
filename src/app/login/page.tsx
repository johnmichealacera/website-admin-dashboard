'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock } from 'lucide-react'
import { Logo } from '@/components/logo'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Logo size="md" className="mr-2" />
            <span className="text-2xl font-bold text-gray-900">LocalWebVentures</span>
          </div>
          <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
          <p className="text-sm text-gray-600 text-center">
            Sign in to access the admin dashboard
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <a href="/auth/login">
            <Button className="w-full" size="lg">
              <Lock className="mr-2 h-4 w-4" />
              Sign In with Auth0
            </Button>
          </a>
          <p className="text-sm text-gray-600 text-center">
            Only authorized administrators can access this system
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 