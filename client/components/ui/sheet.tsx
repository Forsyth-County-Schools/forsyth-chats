"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SheetProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const Sheet: React.FC<SheetProps> = ({ open, onOpenChange, children }) => {
  return (
    <>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { open, onOpenChange } as React.Attributes)
        }
        return child
      })}
    </>
  )
}

const SheetTrigger = React.forwardRef<
  React.ElementRef<"button">,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { open?: boolean; onOpenChange?: (open: boolean) => void }
>(({ className, onClick, open, onOpenChange, ...props }, ref) => (
  <button
    ref={ref}
    className={cn("", className)}
    onClick={(e) => {
      onClick?.(e)
      onOpenChange?.(!open)
    }}
    {...props}
  />
))
SheetTrigger.displayName = "SheetTrigger"

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  side?: "left" | "right" | "top" | "bottom"
}

const SheetContent = React.forwardRef<
  React.ElementRef<"div">,
  SheetContentProps
>(({ className, children, open, onOpenChange, side = "right", ...props }, ref) => {
  // Prevent body scroll when sheet is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  if (!open) return null

  const sideClasses = {
    left: "left-0 top-0 h-full w-3/4 max-w-sm animate-slide-in-from-left",
    right: "right-0 top-0 h-full w-3/4 max-w-sm animate-slide-in-from-right",
    top: "top-0 left-0 w-full h-3/4 max-h-screen animate-slide-in-from-top",
    bottom: "bottom-0 left-0 w-full h-3/4 max-h-screen animate-slide-in-from-bottom",
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/80 animate-in fade-in duration-200"
        onClick={() => onOpenChange?.(false)}
      />
      
      {/* Sheet Content */}
      <div
        ref={ref}
        className={cn(
          "fixed z-50 bg-gray-900 border-gray-800 shadow-lg",
          side === "left" && "border-r",
          side === "right" && "border-l",
          side === "top" && "border-b",
          side === "bottom" && "border-t",
          sideClasses[side],
          className
        )}
        {...props}
      >
        {children}
        <button
          onClick={() => onOpenChange?.(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 text-gray-400 hover:text-white"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  )
})
SheetContent.displayName = "SheetContent"

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-left p-6",
      className
    )}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

const SheetTitle = React.forwardRef<
  React.ElementRef<"h2">,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-lg font-semibold text-white",
      className
    )}
    {...props}
  />
))
SheetTitle.displayName = "SheetTitle"

const SheetDescription = React.forwardRef<
  React.ElementRef<"p">,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-400", className)}
    {...props}
  />
))
SheetDescription.displayName = "SheetDescription"

export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
}
