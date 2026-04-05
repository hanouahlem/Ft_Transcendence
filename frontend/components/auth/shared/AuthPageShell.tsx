import type { ReactNode } from "react";
import AccentBeads from "@/components/decor/AccentBeads";
import ArchiveFilters from "@/components/decor/ArchiveFilters";
import { cn } from "@/lib/utils";
import AuthGreenPanel from "./AuthGreenPanel";

type AuthPageShellProps = {
  children: ReactNode;
  footer?: ReactNode;
  panelAlign?: "left" | "right";
  panelMainTone?: "olive" | "accent-blue";
  panelAccentTone?: "accent-orange" | "accent-red";
  showBeads?: boolean;
  footerClassName?: string;
  containerClassName?: string;
};

export default function AuthPageShell({
  children,
  footer,
  panelAlign = "right",
  panelMainTone = "olive",
  panelAccentTone = "accent-orange",
  showBeads = true,
  footerClassName,
  containerClassName,
}: AuthPageShellProps) {
  const isRightAligned = panelAlign === "right";

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-stage antialiased"
      style={{
        backgroundImage:
          "linear-gradient(rgba(26,26,26,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(26,26,26,0.05) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    >
      <ArchiveFilters />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[69rem] items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div
          className={cn(
            "relative flex w-full flex-col gap-6 lg:h-[700px] lg:justify-center",
            containerClassName,
          )}
        >
          <AuthGreenPanel
            align={panelAlign}
            mainTone={panelMainTone}
            accentTone={panelAccentTone}
          />

          {children}

          {showBeads ? (
            <AccentBeads
              className={cn(
                "absolute z-30 hidden lg:top-[20%] lg:flex lg:translate-x-1/2",
                isRightAligned ? "lg:left-0" : "lg:right-0 lg:-translate-x-1/2",
              )}
              vertical
            />
          ) : null}

          {footer ? (
            <div
              className={cn(
                "text-center lg:absolute lg:-bottom-16 lg:left-0 lg:right-0",
                footerClassName,
              )}
            >
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
