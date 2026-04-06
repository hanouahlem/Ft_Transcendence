"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

const SEARCH_ROUTE = "/search";

export function RightRailSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedQuery = query.trim();
    const searchHref = trimmedQuery
      ? `${SEARCH_ROUTE}?q=${encodeURIComponent(trimmedQuery)}`
      : SEARCH_ROUTE;

    router.push(searchHref);
  };

  return (
    <form className="relative" onSubmit={handleSearchSubmit}>
      <Search className="pointer-events-none absolute left-4 top-3 h-4 w-4 text-label" />
      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search archives..."
        className="archive-input w-full rounded-lg border-0 bg-paper-muted py-2.5 pl-11 pr-9 font-mono text-sm shadow-inner"
      />
      <button
        type="submit"
        className="absolute right-3 top-2.5 font-mono text-sm text-label transition-colors hover:text-ink"
        aria-label="Search archive"
      >
        /
      </button>
    </form>
  );
}
