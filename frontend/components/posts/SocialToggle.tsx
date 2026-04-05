"use client";

import type { MouseEventHandler } from "react";
import { Toggle } from "@ark-ui/react/toggle";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type AccentTone = "blue" | "green" | "orange";

type SocialToggleProps = {
  icon: LucideIcon;
  label: string;
  count: number;
  accent: AccentTone;
  pressed?: boolean;
  disabled?: boolean;
  onClick: () => void;
  onMouseDown?: MouseEventHandler<HTMLButtonElement>;
};

const TOGGLE_STYLES: Record<
  AccentTone,
  { idle: string; active: string; iconActive: string }
> = {
  blue: {
    idle:
      "text-accent-blue hover:bg-accent-blue hover:text-paper",
    active: "bg-accent-blue text-paper",
    iconActive: "fill-current text-paper",
  },
  green: {
    idle:
      "text-accent-green hover:bg-accent-green hover:text-paper",
    active: "bg-accent-green text-paper",
    iconActive: "fill-current text-paper",
  },
  orange: {
    idle: "text-accent-orange hover:bg-accent-orange hover:text-paper",
    active: "bg-accent-orange text-paper",
    iconActive: "fill-current text-paper",
  },
};

export function SocialToggle({
  icon: Icon,
  label,
  count,
  accent,
  pressed = false,
  disabled = false,
  onClick,
  onMouseDown,
}: SocialToggleProps) {
  const palette = TOGGLE_STYLES[accent];

  return (
    <Toggle.Root
      pressed={pressed}
      disabled={disabled}
      onMouseDown={onMouseDown}
      onPressedChange={() => onClick()}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-sm transition-all duration-200 disabled:cursor-not-allowed",
        pressed ? palette.active : palette.idle
      )}
      aria-label={label}
    >
      <Icon
        className={cn("h-4.5 w-4.5", pressed && palette.iconActive)}
        strokeWidth={1.9}
      />
      <span>{count}</span>
    </Toggle.Root>
  );
}
