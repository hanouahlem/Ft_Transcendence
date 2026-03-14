import * as React from "react"

import { cn } from "@/lib/utils"

function FtInput({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "w-full bg-transparent border-0 border-b border-border px-0 py-2 font-serif text-2xl outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-b-2 focus:border-primary disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

function FtInputLabel({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn(
        "text-[0.65rem] uppercase font-semibold tracking-[0.1em] font-sans",
        className
      )}
      {...props}
    />
  )
}

export { FtInput, FtInputLabel }
