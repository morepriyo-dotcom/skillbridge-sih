import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const spotlightVariants = cva(
  "rounded-2xl p-8 text-white flex flex-col gap-4",
  {
    variants: {
      variant: {
        violet: "bg-gradient-violet",
        magenta: "bg-gradient-magenta",
        orange: "bg-gradient-orange",
        coral: "bg-gradient-coral",
      },
    },
    defaultVariants: {
      variant: "violet",
    },
  }
)

export interface SpotlightCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">, VariantProps<typeof spotlightVariants> {
  title?: React.ReactNode;
  description?: React.ReactNode;
}

export function SpotlightCard({ variant, title, description, children, className, ...props }: SpotlightCardProps) {
  return (
    <div className={cn(spotlightVariants({ variant }), className)} {...props}>
      <div className="flex flex-col gap-2">
        {title && <h3 className="text-subhead font-medium">{title}</h3>}
        {description && <p className="text-body text-white/80">{description}</p>}
      </div>
      {children && (
        <div className="mt-2">
          {children}
        </div>
      )}
    </div>
  )
}
