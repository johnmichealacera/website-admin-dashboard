'use client'

import Image from 'next/image'
import { useState } from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showFallback?: boolean
}

export function Logo({ size = 'md', className = '', showFallback = true }: LogoProps) {
  const [hasError, setHasError] = useState(false)

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8 sm:h-10 sm:w-10',
    lg: 'h-12 w-12 sm:h-16 sm:w-16'
  }

  const fallbackTextSize = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  }

  if (hasError && showFallback) {
    return (
      <div className={`${sizeClasses[size]} rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 p-1 flex items-center justify-center ${className}`}>
        <div className={`text-blue-600 font-bold ${fallbackTextSize[size]}`}>
          LWV
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${sizeClasses[size]} rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 p-1 flex-shrink-0 ${className}`}>
      <Image
        src="/localwebventures-logo.png"
        alt="Local Web Ventures"
        fill
        className="object-contain drop-shadow-sm"
        priority
        onError={() => setHasError(true)}
      />
    </div>
  )
} 