import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const archiveButtonVariants = cva(
	"inline-flex items-center justify-center gap-2 rounded-none border text-center font-mono text-[11px] font-bold uppercase tracking-[0.18em] transition-all outline-none focus-visible:ring-4 focus-visible:ring-field-accent/20 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				accent: "border-field-ink bg-field-ink text-field-paper shadow-[2px_4px_0_#ff4a1c] hover:bg-field-ink/90",
				bluesh: "border-field-ink bg-field-accent-blue text-field-paper shadow-[2px_4px_0_#000] hover:bg-field-ink/90",
				paper: "border-field-label/25 bg-field-paper text-field-ink shadow-[2px_3px_0_rgba(26,26,26,0.14)] hover:bg-field-paper-muted",
				stamp: "border-field-accent bg-transparent text-field-accent hover:bg-field-accent hover:text-field-paper",
				subtle: "border-black/10 bg-black/5 text-field-label hover:bg-black/10 hover:text-field-ink",
				delete: "border-field-accent border-none bg-transparent text-field-accent hover:bg-field-accent hover:text-field-paper",
				black: "border-black/10 bg-field-ink text-field-paper hover:bg-black/70 hover:text-field-paper/90",
			},
			size: {
				sm: "min-h-9 px-3 py-2",
				md: "min-h-10 px-4 py-2.5",
				icon: "size-10",
			},
		},
		defaultVariants: {
			variant: "paper",
			size: "md",
		},
	},
);

type ArchiveButtonProps = React.ComponentProps<"button"> &
	VariantProps<typeof archiveButtonVariants>;

export function ArchiveButton({
	className,
	variant,
	size,
	...props
}: ArchiveButtonProps) {
	return (
		<button
			className={cn(archiveButtonVariants({ variant, size }), className)}
			{...props}
		/>
	);
}
