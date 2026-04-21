"use client";

import type { FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

const SEARCH_ROUTE = "/search";

export function RightRailSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isRtl, t } = useI18n();
  const routeQuery =
    pathname === SEARCH_ROUTE ? searchParams.get("q")?.trim() || "" : "";

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const rawQuery = formData.get("q");
    const query = typeof rawQuery === "string" ? rawQuery : "";

    const trimmedQuery = query.trim();
    const searchHref = trimmedQuery
      ? `${SEARCH_ROUTE}?q=${encodeURIComponent(trimmedQuery)}`
      : SEARCH_ROUTE;

    router.push(searchHref);
  };

  return (
    <form
      key={`${pathname}:${routeQuery}`}
      className="relative"
      onSubmit={handleSearchSubmit}
    >
      <Search
        className="pointer-events-none absolute top-3 h-4 w-4 text-label"
        style={{ insetInlineStart: isRtl ? undefined : "1rem", insetInlineEnd: isRtl ? "1rem" : undefined }}
      />
      <input
        type="text"
        name="q"
        defaultValue={routeQuery}
        placeholder={t("rightRail.searchPlaceholder")}
        className="archive-input w-full rounded-lg border-0 bg-paper-muted py-2.5 font-mono text-sm shadow-inner"
        style={{ paddingInlineStart: isRtl ? "2.25rem" : "2.75rem", paddingInlineEnd: isRtl ? "2.75rem" : "2.25rem" }}
      />
      <button
        type="submit"
        className="absolute top-2.5 font-mono text-sm text-label transition-colors hover:text-ink"
        style={{ insetInlineEnd: "0.75rem" }}
        aria-label={t("rightRail.searchButtonLabel")}
      >
        {t("rightRail.token")}
      </button>
    </form>
  );
}
