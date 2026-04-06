import type { ReactNode } from "react";

type AuthFormMetaProps = {
  dateLabel: string;
  locationLabel: string;
  action?: ReactNode;
};

export default function AuthFormMeta({
  dateLabel,
  locationLabel,
  action,
}: AuthFormMetaProps) {
  return (
    <div className="relative mb-6 border-b-2 border-ink pb-8">
      <div className="space-y-2 font-mono text-[10px] uppercase tracking-[0.12em] text-label sm:text-[11px]">
        <div className="flex gap-4">
          <span className="w-12 opacity-60">Date:</span>
          <span className="font-bold text-ink">{dateLabel}</span>
        </div>
        <div className="flex gap-4">
          <span className="w-12 opacity-60">Loc:</span>
          <span className="italic text-ink">{locationLabel}</span>
        </div>
      </div>

      {action}
    </div>
  );
}
