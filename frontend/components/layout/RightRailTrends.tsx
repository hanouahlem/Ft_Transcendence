import Link from "next/link";
import { cn } from "@/lib/utils";

const SEARCH_ROUTE = "/search";

const TRENDS = [
  { rank: "01", title: "42", meta: "School / Subject" },
  { rank: "02", title: "Tailwind CSS", meta: "Frontend / Styling" },
  { rank: "03", title: "Development", meta: "Build / Workflow" },
];

export function RightRailTrends() {
  return (
    <section className="relative">
      <div className="mb-6 inline-block -rotate-1 bg-ink px-4 py-1 text-paper">
        <span className="font-display text-lg font-bold uppercase tracking-[0.08em]">
          Current Trends
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
            aria-label={`Search for ${trend.title}`}
          >
            <span className="border-r border-black/15 pr-3 font-mono text-xs text-label">
              {trend.rank}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-bold leading-none text-ink">{trend.title}</p>
              <p className="mt-1 font-mono text-[10px] text-label">{trend.meta}</p>
            </div>
            <span className="font-mono text-xs text-label transition-colors group-hover:text-ink">
              [+]
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
