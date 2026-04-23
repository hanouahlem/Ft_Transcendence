import Link from "next/link";
import ArchiveFilters from "@/components/decor/ArchiveFilters";
import AccentBeads from "@/components/decor/AccentBeads";

type LegalSection = {
  title: string;
  body: string;
};

type LegalNote = {
  label: string;
  value: string;
};

type LegalPageLayoutProps = {
  eyebrow: string;
  title: string;
  summary: string;
  updatedAt: string;
  notes: LegalNote[];
  sections: LegalSection[];
  alternateLink: {
    href: string;
    label: string;
  };
};

export default function LegalPageLayout({
  eyebrow,
  title,
  summary,
  updatedAt,
  notes,
  sections,
  alternateLink,
}: LegalPageLayoutProps) {
  return (
    <main className="archive-page relative min-h-screen overflow-hidden px-6 py-10 sm:px-8 lg:px-12">
      <ArchiveFilters />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(58,105,138,0.12),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(40,90,53,0.12),transparent_30%)]" />

      <div className="relative z-10 mx-auto max-w-4xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-3 border border-black/10 bg-paper px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-label shadow-[3px_3px_0_rgba(0,0,0,0.08)] transition-transform hover:-translate-y-0.5 hover:text-ink"
          >
            <AccentBeads />
            Archive Index
          </Link>

          <Link
            href={alternateLink.href}
            className="inline-flex items-center gap-2 border border-black/10 bg-paper-muted px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-label shadow-[3px_3px_0_rgba(0,0,0,0.08)] transition-transform hover:-translate-y-0.5 hover:text-ink"
          >
            Related Document
            <span className="text-ink">{alternateLink.label}</span>
          </Link>
        </div>

        <div>
          <section className="archive-paper relative border border-black/10 p-6 sm:p-8">
            <div className="absolute left-8 top-0 h-5 w-24 -translate-y-1/2 rotate-[-3deg] bg-accent-blue/25 archive-tape" />
            <div className="absolute right-10 top-0 h-5 w-18 -translate-y-1/2 rotate-[4deg] bg-accent-red/20 archive-tape" />

            <div className="mb-8 border-b border-dashed border-black/15 pb-6">
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.28em] text-label">
                {eyebrow}
              </p>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-label sm:text-lg">
                {summary}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="border border-black/10 bg-paper-muted/70 px-4 py-3 shadow-[3px_3px_0_rgba(0,0,0,0.05)] sm:col-span-2 xl:col-span-1">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-label">
                    Last Updated
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink">{updatedAt}</p>
                </div>
                {notes.map((note) => (
                  <div
                    key={note.label}
                    className="border border-black/10 bg-paper-muted/70 px-4 py-3 shadow-[3px_3px_0_rgba(0,0,0,0.05)]"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-label">
                      {note.label}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-ink">{note.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              {sections.map((section, index) => (
                <article
                  key={section.title}
                  className={[
                    "border border-black/10 p-5 shadow-[4px_4px_0_rgba(0,0,0,0.06)]",
                    index % 2 === 0 ? "rotate-[-0.4deg] bg-paper" : "rotate-[0.45deg] bg-paper-muted/85",
                  ].join(" ")}
                >
                  <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.24em] text-label">
                    Section {String(index + 1).padStart(2, "0")}
                  </p>
                  <h2 className="text-xl font-semibold text-ink">{section.title}</h2>
                  <p className="mt-3 text-[15px] leading-7 text-label">{section.body}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
