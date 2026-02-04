import React from 'react'
import { cn } from '../../lib/utils'

const Input = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white transition-colors',
        className
      )}
      {...props}
    />
  )
})

Input.displayName = 'Input'

export default Input
