'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { getOptimizationStatus } from '@/lib/utils/cloudinary-upload'
import { CheckCircle, AlertCircle, Info } from 'lucide-react'

interface OptimizationStatusProps {
  showDetails?: boolean
  className?: string
}

export function OptimizationStatus({ showDetails = false, className = '' }: OptimizationStatusProps) {
  const [status, setStatus] = useState<{
    supported: boolean
    recommended: boolean
    message: string
  } | null>(null)

  useEffect(() => {
    setStatus(getOptimizationStatus())
  }, [])

  if (!status) {
    return null
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {status.supported ? (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          WebP Optimized
        </Badge>
      ) : (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <AlertCircle className="w-3 h-3 mr-1" />
          Standard Upload
        </Badge>
      )}
      
      {showDetails && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Info className="w-3 h-3" />
          <span>{status.message}</span>
        </div>
      )}
    </div>
  )
} 