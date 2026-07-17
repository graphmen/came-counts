import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--wez-green-glow)]",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-wez-green text-white",
        secondary:
          "border-transparent bg-wez-stone-100 text-wez-ink",
        destructive:
          "border-transparent bg-rose-500 text-white",
        outline: "text-wez-ink border-[var(--wez-border)]",
        success: "border-transparent bg-wez-mint text-wez-green",
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
