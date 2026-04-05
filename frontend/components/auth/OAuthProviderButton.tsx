import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type OAuthProviderButtonProps = {
  label: string;
  icon: ReactNode;
  href?: string;
  disabled?: boolean;
  className?: string;
};

const baseClassName =
  "flex flex-1 items-center justify-center gap-3 border border-label/30 bg-white px-4 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-ink transition-all";

export default function OAuthProviderButton({
  label,
  icon,
  href,
  disabled = false,
  className,
}: OAuthProviderButtonProps) {
  const sharedClassName = cn(
    baseClassName,
    disabled
      ? "cursor-not-allowed opacity-50"
      : "hover:border-ink hover:bg-ink hover:text-paper",
    className,
  );

  if (!disabled && href) {
    return (
      <a href={href} className={sharedClassName}>
        {icon}
        {label}
      </a>
    );
  }

  return (
    <button type="button" disabled className={sharedClassName}>
      {icon}
      {label}
    </button>
  );
}
