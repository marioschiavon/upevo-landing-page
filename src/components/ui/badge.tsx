import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success:
          "border-transparent bg-green-500 text-white hover:bg-green-600",
        neutral:
          "border-transparent bg-slate-400 text-white hover:bg-slate-500",
        warning:
          "border-transparent bg-yellow-500 text-white hover:bg-yellow-600",
        info:
          "border-transparent bg-info text-info-foreground hover:bg-info/80",
        purple:
          "border-transparent bg-brand-purple text-brand-purple-foreground hover:bg-brand-purple/80",
        orange:
          "border-transparent bg-brand-orange text-brand-orange-foreground hover:bg-brand-orange/80",
        teal:
          "border-transparent bg-brand-teal text-brand-teal-foreground hover:bg-brand-teal/80",
        pink:
          "border-transparent bg-brand-pink text-brand-pink-foreground hover:bg-brand-pink/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
