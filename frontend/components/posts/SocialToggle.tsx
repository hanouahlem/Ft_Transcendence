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
      "text-field-accent-blue hover:bg-field-accent-blue hover:text-field-paper",
    active: "bg-field-accent-blue text-field-paper",
    iconActive: "fill-current text-field-paper",
  },
  green: {
    idle:
      "text-field-accent-green hover:bg-field-accent-green hover:text-field-paper",
    active: "bg-field-accent-green text-field-paper",
    iconActive: "fill-current text-field-paper",
  },
  orange: {
    idle: "text-field-accent hover:bg-field-accent hover:text-field-paper",
    active: "bg-field-accent text-field-paper",
    iconActive: "fill-current text-field-paper",
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
