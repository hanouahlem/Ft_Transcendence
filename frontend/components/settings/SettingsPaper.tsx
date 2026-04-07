"use client";

import type { ReactNode } from "react";
import ArchiveTape from "@/components/decor/ArchiveTape";

type SettingsPaperProps = {
  title: string;
  subtitle: string;
  stampText: string;
  children: ReactNode;
  footer: ReactNode;
};

export function SettingsPaper({
  title,
  subtitle,
  stampText,
  children,
  footer,
}: SettingsPaperProps) {
  return (
    <section
      className="archive-paper relative border border-black/10 px-6 py-8 md:px-10 md:py-12"
      style={{ transform: "rotate(0.5deg)" }}
    >
      <ArchiveTape className="-top-4 left-1/2 h-8 w-32 -translate-x-1/2 rotate-1" />
      <div className="archive-thread" />

      <div className="pl-10">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b-2 border-ink pb-6">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-[-0.05em] text-ink md:text-[2rem]">
              {title}
            </h1>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.38em] text-label">
              {subtitle}
            </p>
          </div>

          <div className="inline-block border-2 border-label/40 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-accent-orange opacity-70 rotate-[-3deg]">
            {stampText}
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-x-8 md:gap-y-10">
          {children}
        </div>

        <footer className="mt-10 border-t border-ink pt-4 opacity-60 grayscale">
          {footer}
        </footer>
      </div>
    </section>
  );
}
