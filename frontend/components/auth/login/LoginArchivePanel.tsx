import { MonoText } from "./LoginDecor";

export default function LoginArchivePanel() {
  return (
    <section className="relative overflow-hidden border border-black/20 bg-field-olive px-6 py-8 text-field-paper shadow-[15px_15px_30px_rgba(0,0,0,0.2)] sm:px-8 sm:py-10 lg:absolute lg:top-[var(--login-green-top)] lg:right-[var(--login-green-right)] lg:bottom-[var(--login-green-bottom)] lg:w-[var(--login-green-width)] lg:px-10 lg:py-10">
      <svg
        className="pointer-events-none absolute -bottom-24 -right-14 h-[26rem] w-[26rem] rotate-12 fill-none stroke-white/10"
        viewBox="0 0 50 50"
        aria-hidden="true"
      >
        <polygon points="25,2 31,18 48,25 31,32 25,48 19,32 2,25 19,18" />
      </svg>

      <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/20 to-transparent" />
      <div className="absolute inset-y-0 left-3 w-px bg-[repeating-linear-gradient(to_bottom,var(--color-field-accent)_0,var(--color-field-accent)_8px,transparent_8px,transparent_16px)]" />
      <div className="absolute inset-y-0 left-[18px] w-px bg-[repeating-linear-gradient(to_bottom,var(--color-field-accent)_0,var(--color-field-accent)_8px,transparent_8px,transparent_16px)]" />

      <div className="relative z-10 flex h-full flex-col justify-between gap-10">
        <div className="ml-auto flex max-w-md flex-col items-end text-right lg:w-2/3">
          <div className="mb-8 flex w-full flex-row-reverse items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-white/35">
              <svg
                className="h-8 w-8 fill-none stroke-white/70"
                viewBox="0 0 50 50"
                aria-hidden="true"
              >
                <polygon points="25,2 31,18 48,25 31,32 25,48 19,32 2,25 19,18" />
              </svg>
            </div>
            <div className="h-px flex-1 bg-white/30" />
          </div>

          <h1 className="font-field-display text-8xl font-black uppercase leading-[0.85] tracking-[-0.05em] text-field-paper mix-blend-overlay">
            Field
            <br />
            Notes
          </h1>

          <div className="mt-8 space-y-2 text-right">
            <MonoText className="block text-xs text-field-paper/75">
              Official Repository
            </MonoText>
            <MonoText className="block text-xs text-field-paper/75">
              Est. 1892
            </MonoText>
          </div>
        </div>

        <div className="ml-auto max-w-sm border-r-2 border-field-accent/50 pr-4 text-right">
          <MonoText className="block text-[10px] leading-5 tracking-[0.16em] text-field-paper/55">
            Property of the global observation network. Unauthorized access is
            strictly recorded. Ensure all entries are permanently affixed.
          </MonoText>
        </div>
      </div>
    </section>
  );
}
