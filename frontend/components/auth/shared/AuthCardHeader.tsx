import type { ReactNode } from "react";

type AuthCardHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  decoration?: ReactNode;
};

export default function AuthCardHeader({
  eyebrow,
  title,
  subtitle,
  decoration,
}: AuthCardHeaderProps) {
  return (
    <header className="mb-10 flex items-start justify-between gap-6">
      <div>
        <div className="mb-3 inline-block bg-ink px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-paper sm:text-[10px]">
          {eyebrow}
        </div>
        <h2 className="font-display text-3xl font-black uppercase tracking-[-0.025em] text-ink sm:text-4xl">
          {title}
        </h2>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-label">
          {subtitle}
        </p>
      </div>
      {decoration}
    </header>
  );
}
