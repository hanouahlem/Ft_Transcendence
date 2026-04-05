import MonoText from "@/components/typography/MonoText";
import { cn } from "@/lib/utils";

type AuthGreenPanelProps = {
  align?: "left" | "right";
};

export default function AuthGreenPanel({
  align = "right",
}: AuthGreenPanelProps) {
  const isRightAligned = align === "right";

  return (
    <section
      className={cn(
        "relative overflow-hidden border border-black/20 bg-olive px-6 py-8 text-paper shadow-[15px_15px_30px_rgba(0,0,0,0.2)] sm:px-8 sm:py-10 lg:absolute lg:top-10 lg:bottom-10 lg:w-[65%] lg:px-10 lg:py-10",
        isRightAligned ? "lg:right-4" : "lg:left-4",
      )}
    >
      <svg
        className={cn(
          "pointer-events-none absolute -bottom-24 h-[26rem] w-[26rem] fill-none stroke-white/10",
          isRightAligned ? "-right-14 rotate-12" : "-left-14 -rotate-12",
        )}
        viewBox="0 0 50 50"
        aria-hidden="true"
      >
        <polygon points="25,2 31,18 48,25 31,32 25,48 19,32 2,25 19,18" />
      </svg>

      <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/20 to-transparent" />
      <div className="absolute inset-y-0 left-3 w-px bg-[repeating-linear-gradient(to_bottom,var(--color-accent-orange)_0,var(--color-accent-orange)_8px,transparent_8px,transparent_16px)]" />
      <div className="absolute inset-y-0 left-[18px] w-px bg-[repeating-linear-gradient(to_bottom,var(--color-accent-orange)_0,var(--color-accent-orange)_8px,transparent_8px,transparent_16px)]" />

      <div className="relative z-10 flex h-full flex-col justify-between gap-10">
        <div
          className={cn(
            "flex max-w-md flex-col lg:w-2/3",
            isRightAligned
              ? "ml-auto items-end text-right"
              : "mr-auto items-start text-left",
          )}
        >
          <div
            className={cn(
              "mb-8 flex w-full items-center gap-4",
              isRightAligned ? "flex-row-reverse" : "flex-row",
            )}
          >
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

          <h1 className="font-display text-8xl font-black uppercase leading-[0.85] tracking-[-0.05em] text-paper mix-blend-overlay">
            Field
            <br />
            Notes
          </h1>

          <div className={cn("mt-8 space-y-2", isRightAligned && "text-right")}>
            <MonoText className="block text-xs text-paper/75">
              Official Repository
            </MonoText>
            <MonoText className="block text-xs text-paper/75">
              Est. 1892
            </MonoText>
          </div>
        </div>

        <div
          className={cn(
            "max-w-sm border-accent-orange/50 text-[inherit]",
            isRightAligned
              ? "ml-auto border-r-2 pr-4 text-right"
              : "mr-auto border-l-2 pl-4 text-left",
          )}
        >
          <MonoText className="block text-[10px] leading-5 tracking-[0.16em] text-paper/55">
            Property of the global observation network. Unauthorized access is
            strictly recorded. Ensure all entries are permanently affixed.
          </MonoText>
        </div>
      </div>
    </section>
  );
}
