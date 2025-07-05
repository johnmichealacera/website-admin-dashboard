import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type CardProps = HTMLAttributes<HTMLDivElement>

export const Card = ({ className, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 bg-white shadow-sm',
        className
      )}
      {...props}
    />
  )
}

type CardHeaderProps = HTMLAttributes<HTMLDivElement>

export const CardHeader = ({ className, ...props }: CardHeaderProps) => {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
}

type CardTitleProps = HTMLAttributes<HTMLHeadingElement>

export const CardTitle = ({ className, ...props }: CardTitleProps) => {
  return (
    <h3
      className={cn(
        'text-lg font-semibold leading-none tracking-tight',
        className
      )}
      {...props}
    />
  )
}

type CardContentProps = HTMLAttributes<HTMLDivElement>

export const CardContent = ({ className, ...props }: CardContentProps) => {
  return <div className={cn('p-6 pt-0', className)} {...props} />
} 