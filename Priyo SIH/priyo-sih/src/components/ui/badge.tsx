import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-sm px-2 py-0.5 text-micro font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-accent-blue/15",
  {
    variants: {
      variant: {
        default: "bg-surface-1 text-ink",
        success: "bg-semantic-success/20 text-semantic-success",
        warning: "bg-orange-500/20 text-orange-500",
        error: "bg-semantic-error/20 text-semantic-error",
        accent: "bg-accent-blue/20 text-accent-blue",
        muted: "bg-surface-2 text-ink-muted",
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
