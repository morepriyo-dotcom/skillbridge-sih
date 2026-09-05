import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-button transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-blue/15 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-ink text-canvas hover:opacity-90 rounded-full",
        secondary: "bg-surface-1 text-ink hover:opacity-90 rounded-full",
        translucent: "bg-surface-2 text-ink rounded-2xl",
        ghost: "bg-transparent text-ink-muted hover:text-ink rounded-md",
        danger: "bg-semantic-error text-white hover:opacity-90 rounded-full",
      },
      size: {
        default: "py-2.5 px-4",
        sm: "text-xs py-1.5 px-3",
        lg: "text-sm py-3 px-6",
        translucent: "py-[8px] px-[14px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ 
          variant, 
          size: variant === 'translucent' ? 'translucent' : size, 
          className 
        }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
