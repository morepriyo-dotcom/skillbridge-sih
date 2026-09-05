import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col w-full space-y-1.5">
        {label && (
          <label className="text-body-sm font-medium text-ink">
            {label}
          </label>
        )}
        <textarea
          className={cn(
            "flex min-h-[80px] w-full bg-surface-1 text-ink rounded-md px-[14px] py-[10px] text-body focus:outline-none focus:ring-1 focus:ring-accent-blue/15 disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-ink-muted transition-shadow",
            error && "ring-1 ring-semantic-error focus:ring-semantic-error",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <span className="text-micro text-semantic-error">{error}</span>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
