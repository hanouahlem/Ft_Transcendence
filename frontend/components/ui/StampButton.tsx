import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type StampButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	stampClassName?: string;
	textClassName?: string;
	paddingClassName?: string;
	borderClassName?: string;
	rotationDeg?: number;
	children: ReactNode;
};

export default function StampButton({
	className,
	stampClassName,
	textClassName,
	paddingClassName,
	borderClassName,
	rotationDeg = -6,
	children,
	...props
}: StampButtonProps) {
	return (
		<button
			className={cn(
				"origin-center cursor-pointer transition-transform duration-200 hover:scale-105 hover:-rotate-2 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60",
				className,
			)}
			{...props}
		>
			<span
				className={cn(
					"relative inline-flex items-center justify-center rounded-xl bg-transparent font-stamp font-black uppercase tracking-[0.2em] text-accent-red",
					"px-4 py-2",
					"text-4xl",
					paddingClassName,
					textClassName,
					stampClassName,
				)}
				style={{ transform: `rotate(${rotationDeg}deg)`, filter: "url(#ink-texture)" }}
			>
				<span
					aria-hidden="true"
					className={cn(
						"pointer-events-none absolute inset-0 rounded-xl border-4 border-accent-red",
						borderClassName,
					)}

				/>
				{children}
			</span>
		</button>
	);
}
