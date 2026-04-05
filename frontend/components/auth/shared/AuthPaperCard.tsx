import type { ReactNode } from "react";
import ArchiveTape from "@/components/decor/ArchiveTape";
import { cn } from "@/lib/utils";

type AuthPaperCardProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  topTapeClassName?: string;
  bottomTapeClassName?: string;
};

export default function AuthPaperCard({
  children,
  className,
  contentClassName,
  topTapeClassName = "-top-3 left-[24%] h-8 w-32 -rotate-3",
  bottomTapeClassName = "-bottom-2 right-[24%] h-6 w-24 rotate-2",
}: AuthPaperCardProps) {
  return (
    <section
      className={cn(
        "relative z-20 overflow-visible border border-paper-muted bg-paper shadow-[0_20px_50px_rgba(0,0,0,0.4)]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(var(--color-paper-muted) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />

      <ArchiveTape className={topTapeClassName} />
      <ArchiveTape className={bottomTapeClassName} />

      <div className={cn("relative flex h-full flex-col", contentClassName)}>
        {children}
      </div>
    </section>
  );
}
