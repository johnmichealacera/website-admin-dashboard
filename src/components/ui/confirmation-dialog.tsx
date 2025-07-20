'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star, CheckCircle, Trash2 } from 'lucide-react'

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  type: 'delete' | 'feature' | 'confirm'
  confirmText?: string
  cancelText?: string
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type,
  confirmText,
  cancelText = 'Cancel'
}: ConfirmationDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
    } finally {
      setIsLoading(false)
      onClose()
    }
  }

  const getTypeStyles = () => {
    switch (type) {
      case 'delete':
        return {
          icon: <Trash2 className="h-6 w-6 text-red-500" />,
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
          cardBorder: 'border-red-200',
          bgColor: 'bg-red-50'
        }
      case 'feature':
        return {
          icon: <Star className="h-6 w-6 text-yellow-500" />,
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          cardBorder: 'border-yellow-200',
          bgColor: 'bg-yellow-50'
        }
      case 'confirm':
        return {
          icon: <CheckCircle className="h-6 w-6 text-green-500" />,
          confirmButton: 'bg-green-600 hover:bg-green-700 text-white',
          cardBorder: 'border-green-200',
          bgColor: 'bg-green-50'
        }
    }
  }

  const styles = getTypeStyles()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className={`w-full max-w-md ${styles.cardBorder} ${styles.bgColor}`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            {styles.icon}
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">{message}</p>
          <div className="flex space-x-3 justify-center">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              className={styles.confirmButton}
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {confirmText || 'Confirming...'}
                </div>
              ) : (
                confirmText || 'Confirm'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 