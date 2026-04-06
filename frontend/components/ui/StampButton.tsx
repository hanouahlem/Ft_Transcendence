import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type StampButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	stampClassName?: string;
	children: ReactNode;
};

export default function StampButton({
	className,
	stampClassName,
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
					"relative inline-flex items-center justify-center rounded-xl bg-transparent px-4 py-2 font-stamp text-4xl font-black uppercase tracking-[0.2em] text-accent-red",
					stampClassName,
				)}
				style={{ transform: "rotate(-6deg)" }}
			>
				<span
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 rounded-xl border-4 border-accent-red"
					style={{ filter: "url(#ink-texture)" }}
				/>
				{children}
			</span>
		</button>
	);
}
