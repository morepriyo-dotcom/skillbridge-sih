"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function Dialog({ isOpen, onClose, title, description, children, className }: DialogProps) {
  const dialogRef = React.useRef<HTMLDialogElement>(null)

  React.useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [isOpen])

  React.useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleCancel = (e: Event) => {
      e.preventDefault()
      onClose()
    }

    dialog.addEventListener("cancel", handleCancel)
    return () => dialog.removeEventListener("cancel", handleCancel)
  }, [onClose])

  if (!isOpen) return null

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        "backdrop:bg-canvas/80 backdrop:backdrop-blur-sm",
        "bg-surface-1 text-ink rounded-xl p-6 shadow-2xl m-auto max-w-lg w-full border-none",
        className
      )}
      onClick={(e) => {
        if (e.target === dialogRef.current) {
          onClose()
        }
      }}
    >
      <div className="flex flex-col space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col space-y-1.5">
            {title && <h2 className="text-headline">{title}</h2>}
            {description && <p className="text-body-sm text-ink-muted">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-surface-2 transition-colors focus:outline-none focus:ring-1 focus:ring-accent-blue/15"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-ink-muted hover:text-ink" />
          </button>
        </div>
        <div className="pt-2">
          {children}
        </div>
      </div>
    </dialog>
  )
}
