"use client";

import * as React from "react";
import {
  PaginationContext as ArkPaginationContext,
  PaginationEllipsis as ArkPaginationEllipsis,
  PaginationItem as ArkPaginationItem,
  PaginationNextTrigger as ArkPaginationNextTrigger,
  PaginationPrevTrigger as ArkPaginationPrevTrigger,
  PaginationRoot as ArkPaginationRoot,
  type PaginationPageChangeDetails,
} from "@ark-ui/react/pagination";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const triggerClassName = cn(
  buttonVariants({ variant: "paper", size: "xs" }),
  "min-w-9 px-3",
);

const itemClassName = cn(
  buttonVariants({ variant: "paper", size: "xs" }),
  "min-w-9 px-3 data-[selected]:border-ink data-[selected]:bg-ink data-[selected]:text-paper data-[selected]:shadow-[2px_4px_0_#d32f2f]",
);

const Pagination = React.forwardRef<
  HTMLElement,
  React.ComponentProps<typeof ArkPaginationRoot>
>(({ className, ...props }, ref) => (
  <ArkPaginationRoot
    ref={ref}
    data-slot="pagination"
    className={cn("flex flex-col items-center gap-3", className)}
    {...props}
  />
));

Pagination.displayName = "Pagination";

const PaginationControls = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-wrap items-center justify-center gap-2", className)}
    {...props}
  />
));

PaginationControls.displayName = "PaginationControls";

const PaginationPrevTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof ArkPaginationPrevTrigger>
>(({ className, children, ...props }, ref) => (
  <ArkPaginationPrevTrigger
    ref={ref}
    data-slot="pagination-prev-trigger"
    className={cn(triggerClassName, className)}
    {...props}
  >
    {children ?? (
      <>
        <ChevronLeft className="h-3.5 w-3.5" />
        Prev
      </>
    )}
  </ArkPaginationPrevTrigger>
));

PaginationPrevTrigger.displayName = "PaginationPrevTrigger";

const PaginationNextTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof ArkPaginationNextTrigger>
>(({ className, children, ...props }, ref) => (
  <ArkPaginationNextTrigger
    ref={ref}
    data-slot="pagination-next-trigger"
    className={cn(triggerClassName, className)}
    {...props}
  >
    {children ?? (
      <>
        Next
        <ChevronRight className="h-3.5 w-3.5" />
      </>
    )}
  </ArkPaginationNextTrigger>
));

PaginationNextTrigger.displayName = "PaginationNextTrigger";

const PaginationItem = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof ArkPaginationItem>
>(({ className, children, ...props }, ref) => (
  <ArkPaginationItem
    ref={ref}
    data-slot="pagination-item"
    className={cn(itemClassName, className)}
    {...props}
  >
    {children ?? props.value}
  </ArkPaginationItem>
));

PaginationItem.displayName = "PaginationItem";

const PaginationEllipsis = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof ArkPaginationEllipsis>
>(({ className, children, ...props }, ref) => (
  <ArkPaginationEllipsis
    ref={ref}
    data-slot="pagination-ellipsis"
    className={cn(
      "flex min-h-8 min-w-8 items-center justify-center border border-dashed border-label/30 bg-paper px-2 text-label",
      className,
    )}
    {...props}
  >
    {children ?? <MoreHorizontal className="h-3.5 w-3.5" />}
  </ArkPaginationEllipsis>
));

PaginationEllipsis.displayName = "PaginationEllipsis";

function PaginationItems({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="pagination-items"
      className={cn("flex flex-wrap items-center justify-center gap-2", className)}
      {...props}
    >
      <ArkPaginationContext>
        {(pagination) =>
          pagination.pages.map((page, index) =>
            page.type === "page" ? (
              <PaginationItem
                key={page.value}
                type="page"
                value={page.value}
              />
            ) : (
              <PaginationEllipsis
                key={`ellipsis-${index}`}
                index={index}
              />
            ),
          )
        }
      </ArkPaginationContext>
    </div>
  );
}

function PaginationSummary({
  className,
  itemLabel = "results",
}: React.ComponentProps<"p"> & {
  itemLabel?: string;
}) {
  return (
    <ArkPaginationContext>
      {(pagination) => {
        if (pagination.count === 0) {
          return null;
        }

        return (
          <p
            className={cn(
              "text-center font-mono text-[11px] uppercase tracking-[0.18em] text-label",
              className,
            )}
          >
            Showing {pagination.pageRange.start + 1}-{pagination.pageRange.end} of{" "}
            {pagination.count} {itemLabel}
          </p>
        );
      }}
    </ArkPaginationContext>
  );
}

export {
  Pagination,
  PaginationControls,
  PaginationEllipsis,
  PaginationItem,
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationSummary,
  type PaginationPageChangeDetails,
};
