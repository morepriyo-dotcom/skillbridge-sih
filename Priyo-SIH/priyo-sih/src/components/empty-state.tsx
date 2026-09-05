import * as React from "react"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon | React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action, className, ...props }: EmptyStateProps) {
  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (typeof icon === "function" || (typeof icon === "object" && icon !== null)) {
      const IconComp = icon as any;
      return <IconComp className="w-12 h-12" />;
    }
    return null;
  };

  return (
    <div 
      className={cn("flex flex-col items-center justify-center p-8 text-center min-h-[300px] w-full", className)} 
      {...props}
    >
      {icon && (
        <div className="mb-4 text-ink-muted">
          {renderIcon()}
        </div>
      )}
      <h3 className="text-headline mb-2">{title}</h3>
      {description && (
        <p className="text-body text-ink-muted mb-6 max-w-sm">
          {description}
        </p>
      )}
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  )
}
