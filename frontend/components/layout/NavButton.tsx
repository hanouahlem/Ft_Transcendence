import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type NavButtonProps = {
  href: string;
  label: string;
  icon: LucideIcon;
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
        "flex items-center gap-4 rounded-xl px-3 py-3 transition-all duration-200",
        active
          ? "bg-black/5 text-ink"
          : "text-label hover:bg-black/5 hover:text-ink"
      )}
    >
      <div className="relative shrink-0">
        <Icon className="h-7 w-7" strokeWidth={1.6} />

        {typeof badge === "number" && badge > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-paper-muted bg-accent-red px-1 text-[10px] font-bold text-paper">
            {badge}
          </span>
        )}
      </div>

      <span
        className="whitespace-nowrap text-base font-semibold transition-opacity duration-150"
        style={{ opacity: expanded ? 1 : 0 }}
      >
        {label}
      </span>
    </Link>
  );
}
