import Link from "next/link";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { cn } from "@/lib/utils";

type NavButtonProps = {
  href: string;
  label: string;
  icon: IconSvgElement;
  active?: boolean;
  expanded: boolean;
  badge?: number;
};

export function NavButton({
  href,
  label,
  icon: Icon,
  active = false,
  expanded,
  badge,
}: NavButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-4 rounded-xl px-3 py-3 font-sans transition-all duration-200",
        active
          ? "bg-black/5 text-ink"
          : "text-label hover:bg-black/5 hover:text-ink"
      )}
    >
      <div className="relative shrink-0">
        <HugeiconsIcon icon={Icon} size={28} strokeWidth={1.6} />

        {typeof badge === "number" && badge > 0 && (
          <span className="absolute -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-paper-muted bg-accent-red px-1 text-[10px] font-bold text-paper" style={{ insetInlineEnd: "-0.25rem" }}>
            {badge}
          </span>
        )}
      </div>

      <span
        className="whitespace-nowrap text-lg font-medium font-sans transition-opacity duration-150"
        style={{ opacity: expanded ? 1 : 0 }}
      >
        {label}
      </span>
    </Link>
  );
}
