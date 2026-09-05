import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, icon, ...props }, ref) => {
    return (
      <div className="flex flex-col w-full space-y-1.5">
        {label && (
          <label className="text-body-sm font-medium text-ink">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex w-full bg-surface-1 text-ink rounded-md px-[14px] py-[10px] text-body focus:outline-none focus:ring-1 focus:ring-accent-blue/15 disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-ink-muted transition-shadow",
              icon && "pl-10",
              error && "ring-1 ring-semantic-error focus:ring-semantic-error",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <span className="text-micro text-semantic-error">{error}</span>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
