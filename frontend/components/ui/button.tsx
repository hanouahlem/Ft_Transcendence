import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-none border text-center font-mono text-[11px] font-bold uppercase tracking-[0.18em] transition-all outline-none focus-visible:ring-4 focus-visible:ring-field-accent/20 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-field-ink bg-field-ink text-field-paper shadow-[2px_4px_0_#ff4a1c] hover:bg-field-ink/90",
        outline:
          "border-field-label/25 bg-field-paper text-field-ink shadow-[2px_3px_0_rgba(26,26,26,0.14)] hover:bg-field-paper-muted",
        secondary:
          "border-black/10 bg-black/5 text-field-label hover:bg-black/10 hover:text-field-ink",
        destructive:
          "border-none bg-transparent text-field-accent hover:bg-field-accent hover:text-field-paper",
        ghost:
          "border-transparent bg-transparent text-field-label hover:border-black/10 hover:bg-black/5 hover:text-field-ink",
        link: "border-transparent bg-transparent text-field-accent underline underline-offset-4 shadow-none hover:text-field-ink",
        accent:
          "border-field-ink bg-field-ink text-field-paper shadow-[2px_4px_0_#ff4a1c] hover:bg-field-ink/90",
        bluesh:
          "border-field-ink bg-field-accent-blue text-field-paper shadow-[2px_4px_0_#000] hover:bg-field-ink/90",
        paper:
          "border-field-label/25 bg-field-paper text-field-ink shadow-[2px_3px_0_rgba(26,26,26,0.14)] hover:bg-field-paper-muted",
        stamp:
          "border-field-accent bg-transparent text-field-accent hover:bg-field-accent hover:text-field-paper",
        subtle:
          "border-black/10 bg-black/5 text-field-label hover:bg-black/10 hover:text-field-ink",
        delete:
          "border-none bg-transparent text-field-accent hover:bg-field-accent hover:text-field-paper",
        black:
          "border-black/10 bg-field-ink text-field-paper hover:bg-black/70 hover:text-field-paper/90",
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
