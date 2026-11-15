import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-brand-blue text-white shadow hover:bg-blue-700',
        primary:
          'border-transparent bg-brand-blue text-white shadow hover:bg-blue-700',
        secondary:
          'border-transparent bg-slate-100 text-slate-800 hover:bg-slate-200',
        destructive:
          'border-transparent bg-red-500 text-white shadow hover:bg-red-600',
        danger:
          'border-transparent bg-red-500 text-white shadow hover:bg-red-600',
        outline: 'text-foreground border-slate-200',
        accent: 'border-transparent bg-brand-green/20 text-[#4c6613] font-bold',
        megh: 'border-blue-200 bg-blue-50 text-brand-blue font-bold',
        warning: 'border-amber-200 bg-amber-50 text-amber-800 font-semibold',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
