"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AlertDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const AlertDialog: React.FC<AlertDialogProps> = ({ open, onOpenChange, children }) => {
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

const AlertDialogTrigger = React.forwardRef<
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
AlertDialogTrigger.displayName = "AlertDialogTrigger"

const AlertDialogContent = React.forwardRef<
  React.ElementRef<"div">,
  React.HTMLAttributes<HTMLDivElement> & { open?: boolean; onOpenChange?: (open: boolean) => void }
>(({ className, children, open, onOpenChange, ...props }, ref) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/80 animate-in fade-in duration-200"
        onClick={() => onOpenChange?.(false)}
      />
      
      {/* Content */}
      <div
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 animate-in zoom-in-95 fade-in",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  )
})
AlertDialogContent.displayName = "AlertDialogContent"

const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<"h2">,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
AlertDialogTitle.displayName = "AlertDialogTitle"

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<"p">,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
AlertDialogDescription.displayName = "AlertDialogDescription"

const AlertDialogAction = React.forwardRef<
  React.ElementRef<"button">,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { open?: boolean; onOpenChange?: (open: boolean) => void }
>(({ className, onClick, open, onOpenChange, ...props }, ref) => (
  <button
    ref={ref}
    className={cn("", className)}
    onClick={(e) => {
      onClick?.(e)
      onOpenChange?.(false)
    }}
    {...props}
  />
))
AlertDialogAction.displayName = "AlertDialogAction"

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<"button">,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { open?: boolean; onOpenChange?: (open: boolean) => void }
>(({ className, onClick, open, onOpenChange, ...props }, ref) => (
  <button
    ref={ref}
    className={cn("", className)}
    onClick={(e) => {
      onClick?.(e)
      onOpenChange?.(false)
    }}
    {...props}
  />
))
AlertDialogCancel.displayName = "AlertDialogCancel"

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
