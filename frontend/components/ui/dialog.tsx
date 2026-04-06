"use client"

import * as React from "react"
import { Dialog as ArkDialog, Portal } from "@ark-ui/react"

import { cn } from "@/lib/utils"

type DialogProps = Omit<
  React.ComponentProps<typeof ArkDialog.Root>,
  "onOpenChange"
> & {
  onOpenChange?: (open: boolean) => void
}

function Dialog({ onOpenChange, ...props }: DialogProps) {
  return (
    <ArkDialog.Root
      data-slot="dialog"
      lazyMount
      unmountOnExit
      {...props}
      onOpenChange={(details) => onOpenChange?.(details.open)}
    />
  )
}

function DialogPortal(props: React.ComponentProps<typeof Portal>) {
  return <Portal {...props} />
}

const DialogClose = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof ArkDialog.CloseTrigger>
>((props, ref) => {
  return <ArkDialog.CloseTrigger ref={ref} data-slot="dialog-close" {...props} />
})

DialogClose.displayName = "DialogClose"

const DialogOverlay = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof ArkDialog.Backdrop>
>(({ className, ...props }, ref) => {
  return (
    <ArkDialog.Backdrop
      ref={ref}
      data-slot="dialog-overlay"
      className={cn("fixed inset-0 z-50 bg-black/45", className)}
      {...props}
    />
  )
})

DialogOverlay.displayName = "DialogOverlay"

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof ArkDialog.Content>
>(({ className, children, ...props }, ref) => {
  return (
    <DialogPortal>
      <DialogOverlay />
      <ArkDialog.Positioner
        data-slot="dialog-positioner"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <ArkDialog.Content
          ref={ref}
          data-slot="dialog-content"
          className={cn(
            "w-[calc(100vw-2rem)] max-w-[860px] outline-none",
            className
          )}
          {...props}
        >
          {children}
        </ArkDialog.Content>
      </ArkDialog.Positioner>
    </DialogPortal>
  )
})

DialogContent.displayName = "DialogContent"

const DialogTitle = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof ArkDialog.Title>
>(({ className, ...props }, ref) => {
  return (
    <ArkDialog.Title
      ref={ref}
      data-slot="dialog-title"
      className={cn(className)}
      {...props}
    />
  )
})

DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof ArkDialog.Description>
>(({ className, ...props }, ref) => {
  return (
    <ArkDialog.Description
      ref={ref}
      data-slot="dialog-description"
      className={cn(className)}
      {...props}
    />
  )
})

DialogDescription.displayName = "DialogDescription"

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
}
