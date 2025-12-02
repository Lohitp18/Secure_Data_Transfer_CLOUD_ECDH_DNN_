import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', loading, children, disabled, ...props }, ref) => {
    const variants = {
      default: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
      destructive: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
      outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-900',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
      ghost: 'hover:bg-gray-100 text-gray-900'
    }

    const sizes = {
      default: 'h-10 px-4 py-2 text-sm',
      sm: 'h-8 px-3 py-1 text-xs',
      lg: 'h-12 px-8 py-3 text-base',
      icon: 'h-10 w-10'
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }