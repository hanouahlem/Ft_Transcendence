"use client";

import type { ReactNode } from "react";
import ArchiveTape from "@/components/decor/ArchiveTape";

type SettingsPaperProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
};

export function SettingsPaper({
  title,
  subtitle,
  children,
  footer,
}: SettingsPaperProps) {
  return (
    <section
      className="archive-paper relative border border-black/10 bg-white px-7 py-9 shadow-[10px_15px_40px_rgba(26,26,26,0.15)] md:px-12 md:py-12"
      style={{ transform: "rotate(0.5deg)" }}
    >
      <ArchiveTape className="-top-4 left-1/2 h-8 w-32 -translate-x-1/2 rotate-1" />
      <div className="archive-thread" />

      <div className="pl-10 md:pl-12">
        <header className="mb-8 border-b-2 border-ink pb-6 md:mb-10">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-[-0.06em] text-ink md:text-[2rem]">
              {title}
            </h1>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.38em] text-label">
              {subtitle}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-x-10 md:gap-y-10">
          {children}
        </div>

        <footer className="mt-10 border-t border-ink pt-4 opacity-60 grayscale">
          {footer}
        </footer>
      </div>
    </section>
  );
}
