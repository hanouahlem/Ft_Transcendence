"use client";

import * as React from "react";
import {
  TabContent as ArkTabContent,
  TabIndicator as ArkTabIndicator,
  TabList as ArkTabList,
  TabTrigger as ArkTabTrigger,
  TabsRoot as ArkTabsRoot,
} from "@ark-ui/react/tabs";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const tabsListVariants = cva(
  "relative isolate flex w-full items-center gap-4",
  {
    variants: {
      variant: {
        default: "",
        archive:
          "border-b border-dashed border-label/30 text-label",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const tabsTriggerVariants = cva(
  "relative z-10 inline-flex items-center justify-center  pt-1 bg-transparent font-mono text-s uppercase tracking-[0.24em] text-label transition-colors duration-200 outline-none hover:text-accent-red data-[selected]:text-ink disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        default: "",
        archive: "min-h-8",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Tabs = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof ArkTabsRoot>
>(({ className, ...props }, ref) => (
  <ArkTabsRoot
    ref={ref}
    data-slot="tabs"
    className={cn("flex flex-col gap-5", className)}
    {...props}
  />
));

Tabs.displayName = "Tabs";

type TabsListProps = React.ComponentProps<typeof ArkTabList> &
  VariantProps<typeof tabsListVariants>;

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, variant, ...props }, ref) => (
    <ArkTabList
      ref={ref}
      data-slot="tabs-list"
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  ),
);

TabsList.displayName = "TabsList";

type TabsTriggerProps = React.ComponentProps<typeof ArkTabTrigger> &
  VariantProps<typeof tabsTriggerVariants>;

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, variant, ...props }, ref) => (
    <ArkTabTrigger
      ref={ref}
      data-slot="tabs-trigger"
      className={cn(tabsTriggerVariants({ variant }), className)}
      {...props}
    />
  ),
);

TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof ArkTabContent>
>(({ className, ...props }, ref) => (
  <ArkTabContent
    ref={ref}
    data-slot="tabs-content"
    className={cn("outline-none", className)}
    {...props}
  />
));

TabsContent.displayName = "TabsContent";

const TabsIndicator = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof ArkTabIndicator>
>(({ className, style, ...props }, ref) => (
  <ArkTabIndicator
    ref={ref}
    data-slot="tabs-indicator"
    className={cn(
      "pointer-events-none absolute bottom-[-1px] z-0 rounded-full bg-accent-red",
      className,
    )}
    style={{
      ...style,
      ["--transition-duration" as string]: "100ms",
      ["--transition-timing-function" as string]: "ease-out",
      top: "auto",
      width: "var(--width)",
      height: "2px",
    }}
    {...props}
  />
));

TabsIndicator.displayName = "TabsIndicator";

export { Tabs, TabsContent, TabsIndicator, TabsList, TabsTrigger };
