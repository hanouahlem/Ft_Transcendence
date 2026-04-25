import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";

type AuthFormMetaProps = {
  dateLabel: string;
  locationLabel: string;
  action?: ReactNode;
  actionSide?: "left" | "right";
};

export default function AuthFormMeta({
  dateLabel,
  locationLabel,
  action,
  actionSide = "right",
}: AuthFormMetaProps) {
  const { t } = useI18n();

  return (
    <div
      className={cn(
        "relative mb-6 border-b-2 border-ink pb-8",
        actionSide === "left" ? "pl-32" : "pr-32",
      )}
    >
      <div className="space-y-2 font-mono text-[10px] uppercase tracking-[0.12em] text-label sm:text-[11px]">
        <div className="flex gap-4">
          <span className="w-12 opacity-60">{t("auth.meta.date")}</span>
          <span className="font-bold text-ink">{dateLabel}</span>
        </div>
        <div className="flex gap-4">
          <span className="w-12 opacity-60">{t("auth.meta.location")}</span>
          <span className="italic text-ink">{locationLabel}</span>
        </div>
      </div>

      {action}
    </div>
  );
}
