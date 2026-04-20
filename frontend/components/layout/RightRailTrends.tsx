"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";

const SEARCH_ROUTE = "/search";

type RightRailTrendsProps = {
  title: string;
  searchLabel: (title: string) => string;
};

export function RightRailTrends({ title, searchLabel }: RightRailTrendsProps) {
  const { t } = useI18n();

  const TRENDS = [
    { rank: "01", title: t("rightRail.trends.drop.title"), meta: t("rightRail.trends.drop.meta") },
    { rank: "02", title: t("rightRail.trends.guild.title"), meta: t("rightRail.trends.guild.meta") },
    { rank: "03", title: t("rightRail.trends.retro.title"), meta: t("rightRail.trends.retro.meta") },
  ];

  return (
    <section className="relative">
      <div className="mb-6 inline-block -rotate-1 bg-ink px-4 py-1 text-paper">
        <span className="font-display text-lg font-bold uppercase tracking-[0.08em]">
          {title}
        </span>
      </div>

      <div className="flex flex-col">
        {TRENDS.map((trend, index) => (
          <Link
            key={trend.rank}
            href={`${SEARCH_ROUTE}?q=${encodeURIComponent(trend.title)}`}
            className={cn(
              "group flex items-center gap-3 border border-black/10 px-3 py-3 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md",
              index % 2 === 0 ? "bg-paper" : "bg-paper-muted",
              index === 0 && "-rotate-1",
              index === 1 && "rotate-1",
              index === 2 && "-rotate-2",
            )}
            aria-label={searchLabel(trend.title)}
          >
            <span className="border-r border-black/15 pr-3 font-mono text-xs text-label">
              {trend.rank}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-bold leading-none text-ink">{trend.title}</p>
              <p className="mt-1 font-mono text-[10px] text-label">{trend.meta}</p>
            </div>
            <span className="font-mono text-xs text-label transition-colors group-hover:text-ink">
              {t("rightRail.token")}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
