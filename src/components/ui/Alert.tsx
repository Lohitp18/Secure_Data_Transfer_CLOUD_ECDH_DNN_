import React from 'react'
import { cn } from '@/lib/utils'
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react'

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive'
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-blue-50 border-blue-200 text-blue-800',
      success: 'bg-green-50 border-green-200 text-green-800',
      warning: 'bg-amber-50 border-amber-200 text-amber-800',
      destructive: 'bg-red-50 border-red-200 text-red-800'
    }

    const icons = {
      default: Info,
      success: CheckCircle,
      warning: AlertTriangle,
      destructive: XCircle
    }

    const Icon = icons[variant]

    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full rounded-lg border p-4',
          variants[variant],
          className
        )}
        {...props}
      >
        <Icon className="h-4 w-4 absolute left-4 top-4" />
        <div className="ml-7">{props.children}</div>
      </div>
    )
  }
)

Alert.displayName = 'Alert'

export { Alert }