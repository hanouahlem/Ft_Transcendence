"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NotificationFilterState } from "@/lib/notification-utils";

type NotificationsRailProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters: NotificationFilterState;
  onToggleFilter: (filter: keyof NotificationFilterState) => void;
  totalCount: number;
  unreadCount: number;
  visibleCount: number;
  markingAll: boolean;
  onMarkAllAsRead: () => Promise<void>;
};

const FILTER_LABELS: Array<{
  key: keyof NotificationFilterState;
  label: string;
  description: string;
}> = [
  {
    key: "social",
    label: "Field followers",
    description: "Follow and archive-connection activity",
  },
  {
    key: "post",
    label: "Entry reactions",
    description: "Likes, comments, and mentions tied to posts",
  },
  {
    key: "message",
    label: "Direct notes",
    description: "Message-style records and fallback alerts",
  },
];

export function NotificationsRail({
  searchValue,
  onSearchChange,
  filters,
  onToggleFilter,
  totalCount,
  unreadCount,
  visibleCount,
  markingAll,
  onMarkAllAsRead,
}: NotificationsRailProps) {
  const readCount = Math.max(0, totalCount - unreadCount);

  return (
    <aside className="hidden w-[260px] shrink-0 xl:flex xl:flex-col xl:gap-10">
      <div className="sticky top-12 flex h-fit flex-col gap-10 py-2">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-3 h-4 w-4 text-label" />
          <input
            type="text"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search correspondence..."
            className="archive-input w-full rounded-lg border-0 bg-paper-muted py-2.5 pl-11 pr-4 font-mono text-sm shadow-inner"
          />
        </label>

        <section className="relative rotate-1 border border-black/10 bg-paper-muted px-6 py-6 shadow-sm">
          <div className="mb-4 border-b-2 border-ink pb-2 font-mono text-xs uppercase tracking-[0.24em] text-label">
            Notification Ledger
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-label">
                Total
              </p>
              <p className="mt-2 font-display text-3xl font-black text-ink">
                {totalCount}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-label">
                Unread
              </p>
              <p className="mt-2 font-display text-3xl font-black text-accent-red">
                {unreadCount}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-label">
                Read
              </p>
              <p className="mt-2 font-display text-3xl font-black text-accent-blue">
                {readCount}
              </p>
            </div>
          </div>

          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-label">
            Visible records: {visibleCount}
          </p>

          <Button
            type="button"
            variant="stamp"
            size="sm"
            className="mt-5 w-full justify-center"
            disabled={markingAll || unreadCount === 0}
            onClick={() => {
              void onMarkAllAsRead();
            }}
          >
            {markingAll ? "Marking records" : "Mark all as read"}
          </Button>
        </section>

        <section className="relative border border-black/10 bg-paper-muted px-6 py-6 shadow-sm -rotate-1">
          <div className="mb-4 border-b-2 border-ink pb-2 font-mono text-xs uppercase tracking-[0.24em] text-label">
            Notification Settings
          </div>

          <div className="flex flex-col gap-3">
            {FILTER_LABELS.map((item) => {
              const enabled = filters[item.key];

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onToggleFilter(item.key)}
                  className={cn(
                    "flex items-start gap-3 border border-transparent px-1 py-1 text-left transition-colors hover:text-accent-red",
                    enabled ? "text-ink" : "text-label",
                  )}
                >
                  <span className="mt-0.5 flex h-4 w-4 items-center justify-center border border-ink bg-paper">
                    {enabled ? (
                      <span className="h-2 w-2 bg-accent-red" />
                    ) : null}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-mono text-[11px] uppercase tracking-[0.16em]">
                      {item.label}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-label">
                      {item.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="absolute bottom-3 right-4 flex gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-accent-green shadow-[1px_1px_2px_rgba(0,0,0,0.3)]" />
          </div>
        </section>

        <section className="relative -rotate-1 border border-label/20 bg-white/40 px-4 py-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-label">
            Field Advisory
          </div>
          <p className="mt-2 text-sm italic leading-snug text-ink">
            Search and filter stay local to this ledger. The backend remains the
            source of truth for read state, deletion, and destination links.
          </p>
        </section>

        <footer className="mt-auto font-mono text-[10px] leading-relaxed text-label">
          <p>Terms · Privacy · Archive Access</p>
          <p>Structured notifications · Phase 7</p>
        </footer>
      </div>
    </aside>
  );
}
