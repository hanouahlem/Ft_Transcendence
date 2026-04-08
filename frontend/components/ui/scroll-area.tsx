"use client";

import * as React from "react";
import { ScrollArea as ArkScrollArea } from "@ark-ui/react/scroll-area";
import { cn } from "@/lib/utils";

const ScrollArea = React.forwardRef<
	HTMLDivElement,
	React.ComponentProps<typeof ArkScrollArea.Root>
>(({ className, ...props }, ref) => {
	return (
		<ArkScrollArea.Root
			ref={ref}
			data-slot="scroll-area"
			className={cn("relative overflow-hidden", className)}
			{...props}
		/>
	);
});

ScrollArea.displayName = "ScrollArea";

const ScrollAreaViewport = React.forwardRef<
	HTMLDivElement,
	React.ComponentProps<typeof ArkScrollArea.Viewport>
>(({ className, ...props }, ref) => {
	return (
		<ArkScrollArea.Viewport
			ref={ref}
			data-slot="scroll-area-viewport"
			className={cn(
				"size-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
				className,
			)}
			{...props}
		/>
	);
});

ScrollAreaViewport.displayName = "ScrollAreaViewport";

const ScrollAreaContent = React.forwardRef<
	HTMLDivElement,
	React.ComponentProps<typeof ArkScrollArea.Content>
>(({ className, ...props }, ref) => {
	return (
		<ArkScrollArea.Content
			ref={ref}
			data-slot="scroll-area-content"
			className={cn("min-w-full", className)}
			{...props}
		/>
	);
});

ScrollAreaContent.displayName = "ScrollAreaContent";

const ScrollAreaScrollbar = React.forwardRef<
	HTMLDivElement,
	React.ComponentProps<typeof ArkScrollArea.Scrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => {
	return (
		<ArkScrollArea.Scrollbar
			ref={ref}
			data-slot="scroll-area-scrollbar"
			orientation={orientation}
			className={cn(
				"flex touch-none select-none overflow-hidden p-0.5 transition-[width,height,opacity,border-color]",
				orientation === "vertical"
					? "h-full w-0 border-l-0 bg-paper-muted/70 opacity-0 data-[overflow-y]:w-3 data-[overflow-y]:border-l data-[overflow-y]:border-black/10 data-[overflow-y]:opacity-100"
					: "h-0 flex-col border-t-0 bg-paper-muted/70 opacity-0 data-[overflow-x]:h-3 data-[overflow-x]:border-t data-[overflow-x]:border-black/10 data-[overflow-x]:opacity-100",
				className,
			)}
			{...props}
		/>
	);
});

ScrollAreaScrollbar.displayName = "ScrollAreaScrollbar";

const ScrollAreaThumb = React.forwardRef<
	HTMLDivElement,
	React.ComponentProps<typeof ArkScrollArea.Thumb>
>(({ className, ...props }, ref) => {
	return (
		<ArkScrollArea.Thumb
			ref={ref}
			data-slot="scroll-area-thumb"
			className={cn(
				"relative flex-1 rounded-none bg-label/55 before:absolute before:left-1/2 before:top-1/2 before:size-full before:min-h-6 before:min-w-6 before:-translate-x-1/2 before:-translate-y-1/2",
				className,
			)}
			{...props}
		/>
	);
});

ScrollAreaThumb.displayName = "ScrollAreaThumb";

const ScrollAreaCorner = React.forwardRef<
	HTMLDivElement,
	React.ComponentProps<typeof ArkScrollArea.Corner>
>(({ className, ...props }, ref) => {
	return (
		<ArkScrollArea.Corner
			ref={ref}
			data-slot="scroll-area-corner"
			className={cn("bg-paper-muted/70", className)}
			{...props}
		/>
	);
});

ScrollAreaCorner.displayName = "ScrollAreaCorner";

export {
	ScrollArea,
	ScrollAreaViewport,
	ScrollAreaContent,
	ScrollAreaScrollbar,
	ScrollAreaThumb,
	ScrollAreaCorner,
};
