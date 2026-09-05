import * as React from "react"
import { cn } from "@/lib/utils"

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, children, ...props }, ref) => {
    return (
      <div className="flex flex-col w-full space-y-1.5">
        {label && (
          <label className="text-body-sm font-medium text-ink">
            {label}
          </label>
        )}
        <select
          className={cn(
            "flex w-full bg-surface-1 text-ink rounded-md px-[14px] py-[10px] text-body focus:outline-none focus:ring-1 focus:ring-accent-blue/15 disabled:cursor-not-allowed disabled:opacity-50",
            error && "ring-1 ring-semantic-error focus:ring-semantic-error",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        {error && (
          <span className="text-micro text-semantic-error">{error}</span>
        )}
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
