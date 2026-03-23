import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const highlightVariants = cva(
  "inline-block border border-foreground bg-secondary text-secondary-foreground",
  {
    variants: {
      variant: {
        default: "px-1 font-semibold -rotate-1",
        tag: "px-2 py-0.5 text-[0.7rem] uppercase font-medium tracking-[0.02em]",
        flat: "px-1 font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function FtHighlight({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof highlightVariants>) {
  return (
    <span
      className={cn(highlightVariants({ variant }), className)}
      {...props}
    />
  )
}

export { FtHighlight, highlightVariants }
