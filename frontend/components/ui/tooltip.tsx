"use client";

import * as React from "react";
import { Portal } from "@ark-ui/react/portal";
import { Tooltip as ArkTooltip } from "@ark-ui/react/tooltip";
import { cn } from "@/lib/utils";

type TooltipProps = React.ComponentProps<typeof ArkTooltip.Root> & {
  content: React.ReactNode;
  children: React.ReactElement;
  contentClassName?: string;
};

export function Tooltip({
  children,
  content,
  contentClassName,
  positioning,
  openDelay = 250,
  closeDelay = 100,
  ...props
}: TooltipProps) {
  return (
    <ArkTooltip.Root
      openDelay={openDelay}
      closeDelay={closeDelay}
      positioning={{
        placement: "top",
        gutter: 10,
        ...positioning,
      }}
      {...props}
    >
      <ArkTooltip.Trigger asChild>{children}</ArkTooltip.Trigger>
      <Portal>
        <ArkTooltip.Positioner className="fixed z-[2147483647]">
          <ArkTooltip.Content
            className={cn(
              "pointer-events-none relative z-[2147483647] rounded-none border border-ink/20 bg-paper px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink shadow-[4px_6px_18px_rgba(26,26,26,0.16)]",
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
              contentClassName
            )}
          >
            <ArkTooltip.Arrow className="h-2 w-2 [--arrow-background:var(--color-paper)]">
              <ArkTooltip.ArrowTip className="border-r border-b border-ink/20 bg-paper" />
            </ArkTooltip.Arrow>
            {content}
          </ArkTooltip.Content>
        </ArkTooltip.Positioner>
      </Portal>
    </ArkTooltip.Root>
  );
}
