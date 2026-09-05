import { cn } from "@/lib/utils"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "card";
}

function Skeleton({
  className,
  variant = "text",
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-surface-2",
        {
          "h-4 w-full rounded-md": variant === "text",
          "h-12 w-12 rounded-full": variant === "circular",
          "h-32 w-full rounded-xl": variant === "card",
        },
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
