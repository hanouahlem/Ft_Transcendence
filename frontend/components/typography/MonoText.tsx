import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type MonoTextProps = {
  children: ReactNode;
  className?: string;
};

export default function MonoText({ children, className }: MonoTextProps) {
  return (
    <span
      className={cn(
        "font-mono text-[10px] uppercase tracking-[0.28em]",
        className,
      )}
    >
      {children}
    </span>
  );
}
