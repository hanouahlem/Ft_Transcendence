"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/I18nProvider";
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
  const { t } = useI18n();
  const readCount = Math.max(0, totalCount - unreadCount);

  const filterCopy = [
    {
      key: "social" as const,
      label: t("notifications.filters.social.label"),
      description: t("notifications.filters.social.description"),
    },
    {
      key: "post" as const,
      label: t("notifications.filters.post.label"),
      description: t("notifications.filters.post.description"),
    },
    {
      key: "message" as const,
      label: t("notifications.filters.message.label"),
      description: t("notifications.filters.message.description"),
    },
  ];

  return (
    <aside className="hidden w-[260px] shrink-0 xl:flex xl:flex-col xl:gap-10">
      <div className="sticky top-12 flex h-fit flex-col gap-10 py-2">
        <label className="relative block">
          <Search className="pointer-events-none absolute top-3 h-4 w-4 text-label" style={{ insetInlineStart: "1rem" }} />
          <input
            type="text"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t("notifications.searchPlaceholder")}
            className="archive-input w-full rounded-lg border-0 bg-paper-muted py-2.5 font-mono text-sm shadow-inner"
            style={{
              paddingInlineStart: "2.75rem",
              paddingInlineEnd: "1rem",
            }}
          />
        </label>

        <section className="relative rotate-1 border border-black/10 bg-paper-muted px-6 py-6 shadow-sm">
          <div className="mb-4 border-b-2 border-ink pb-2 font-mono text-xs uppercase tracking-[0.24em] text-label">
            {t("notifications.ledgerTitle")}
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-label">
                {t("notifications.stats.total")}
              </p>
              <p className="mt-2 font-display text-3xl font-black text-ink">
                {totalCount}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-label">
                {t("notifications.stats.unread")}
              </p>
              <p className="mt-2 font-display text-3xl font-black text-accent-red">
                {unreadCount}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-label">
                {t("notifications.stats.read")}
              </p>
              <p className="mt-2 font-display text-3xl font-black text-accent-blue">
                {readCount}
              </p>
            </div>
          </div>

          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-label">
            {t("notifications.stats.visible", { count: visibleCount })}
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
            {markingAll ? t("notifications.marking") : t("notifications.markAll")}
          </Button>
        </section>

        <section className="relative border border-black/10 bg-paper-muted px-6 py-6 shadow-sm -rotate-1">
          <div className="mb-4 border-b-2 border-ink pb-2 font-mono text-xs uppercase tracking-[0.24em] text-label">
            {t("notifications.settingsTitle")}
          </div>

          <div className="flex flex-col gap-3">
            {filterCopy.map((item) => {
              const enabled = filters[item.key];

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onToggleFilter(item.key)}
                  className={cn(
                    "flex items-start gap-3 border border-transparent px-1 py-1 text-start transition-colors hover:text-accent-red",
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

          <div className="absolute bottom-3 flex gap-1" style={{ insetInlineEnd: "1rem" }}>
            <div className="h-1.5 w-1.5 rounded-full bg-accent-green shadow-[1px_1px_2px_rgba(0,0,0,0.3)]" />
          </div>
        </section>

        <section className="relative -rotate-1 border border-label/20 bg-white/40 px-4 py-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-label">
            {t("notifications.advisoryTitle")}
          </div>
          <p className="mt-2 text-sm italic leading-snug text-ink">
            {t("notifications.advisoryText")}
          </p>
        </section>

        <footer className="mt-auto font-mono text-[10px] leading-relaxed text-label">
          <p>{t("notifications.footer.primary")}</p>
          <p>{t("notifications.footer.secondary")}</p>
        </footer>
      </div>
    </aside>
  );
}
