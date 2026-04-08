import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-none border text-center font-mono text-[11px] font-bold uppercase tracking-[0.18em] transition-all outline-none focus-visible:ring-4 focus-visible:ring-accent-red/20 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-ink bg-ink text-paper shadow-[2px_4px_0_#d32f2f] hover:bg-ink/90",
        outline:
          "border-label/25 bg-paper text-ink shadow-[2px_3px_0_rgba(26,26,26,0.14)] hover:bg-paper-muted",
        secondary:
          "border-black/10 bg-black/5 text-label hover:bg-black/10 hover:text-ink",
        destructive:
          "border-ink bg-accent-red text-paper shadow-[2px_4px_0_#000] hover:bg-accent-red/80",
        ghost:
          "border-transparent bg-transparent text-label hover:border-black/10 hover:bg-black/5 hover:text-ink",
        link: "border-transparent bg-transparent text-accent-red underline underline-offset-4 shadow-none hover:text-ink",
        accent:
          "border-ink bg-ink text-paper shadow-[2px_4px_0_#d32f2f] hover:bg-ink/90",
        bluesh:
          "border-ink bg-accent-blue text-paper shadow-[2px_4px_0_#000] hover:bg-ink/90",
        paper:
          "border-label/25 bg-paper text-ink shadow-[2px_3px_0_rgba(26,26,26,0.14)] hover:bg-paper-muted",
        stamp:
          "border-accent-red bg-transparent text-accent-red hover:bg-accent-red hover:text-paper",
        subtle:
          "border-black/10 bg-black/5 text-label hover:bg-black/10 hover:text-ink",
        delete:
          "border-none bg-transparent text-accent-red hover:bg-accent-red hover:text-paper",
        black:
          "border-black/10 bg-ink text-paper hover:bg-black/70 hover:text-paper/90",
        ledger:
          "border-ink bg-ink text-paper shadow-[4px_4px_0_#ff4a1c] hover:bg-accent-orange hover:text-paper hover:shadow-[4px_4px_0_#ff4a1c]",
      },
      size: {
        xs: "min-h-8 px-2.5 py-1.5 text-[10px]",
        sm: "min-h-9 px-3 py-2",
        default: "min-h-10 px-4 py-2.5",
        lg: "min-h-11 px-5 py-3 text-xs",
        icon: "size-10",
        "icon-sm": "size-9",
        "icon-lg": "size-11",
        md: "min-h-10 px-4 py-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function ButtonSlot({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  children: React.ReactElement<{
    className?: string;
  } & Record<string, unknown>>;
}) {
  return React.cloneElement(children, {
    ...props,
    className: cn(className, children.props.className),
  });
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (asChild) {
    const child = React.Children.only(children);

    if (!React.isValidElement<{ className?: string }>(child)) {
      return null;
    }

    return (
      <ButtonSlot
        data-slot="button"
        className={classes}
        {...props}
        aria-disabled={props.disabled || undefined}
      >
        {child}
      </ButtonSlot>
    );
  }

  return (
    <button
      data-slot="button"
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
}

export { Button, buttonVariants };
