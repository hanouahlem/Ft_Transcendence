import { cn } from "@/lib/utils";
import { LOGIN_ACCENT_COLORS } from "./loginTheme";

export function MonoText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-field-mono text-[10px] uppercase tracking-[0.28em]",
        className,
      )}
    >
      {children}
    </span>
  );
}

function Bead({ color, className }: { color: string; className?: string }) {
  return (
    <div
      className={cn(
        "h-3.5 w-3.5 rounded-full border border-black/20 shadow-[0_2px_4px_rgba(0,0,0,0.35)]",
        className,
      )}
      style={{ backgroundColor: color }}
    />
  );
}

export function SvgDefinitions() {
  return (
    <svg className="absolute h-0 w-0" aria-hidden="true">
      <defs>
        <filter id="torn-paper" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.08"
            numOctaves="3"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="5"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <filter id="ink-texture" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.2"
            numOctaves="4"
            result="turbulence"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="turbulence"
            scale="3"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}

export function AccentBeads({
  className,
  vertical = false,
}: {
  className?: string;
  vertical?: boolean;
}) {
  return (
    <div
      className={cn("flex gap-2", vertical && "flex-col", className)}
      aria-hidden="true"
    >
      {LOGIN_ACCENT_COLORS.map((color) => (
        <Bead key={color} color={color} />
      ))}
    </div>
  );
}

export function WaxSeal() {
  return (
    <div className="relative -mt-4 mr-2 flex h-12 w-12 rotate-15 items-center justify-center rounded-full bg-field-wax font-field-display text-base font-bold shadow-[inset_2px_2px_6px_rgba(0,0,0,0.5),2px_3px_5px_rgba(0,0,0,0.3)] sm:h-14 sm:w-14 sm:text-2xl">
      <span
        className="text-field-wax/70"
        style={{
          textShadow:
            "-0.75px -0.75px 0 rgba(255,255,255,0.22), 1px 1px 0 rgba(90,20,20,0.42)",
        }}
      >
        42
      </span>
      <div className="absolute inset-0.5 rounded-full border border-white/20" />
    </div>
  );
}
