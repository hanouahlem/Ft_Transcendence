"use client";

import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SettingsFieldProps = {
  label: string;
  className?: string;
  inputClassName?: string;
} & ComponentProps<typeof Input>;

type SettingsTextareaProps = {
  label: string;
  className?: string;
  textareaClassName?: string;
} & ComponentProps<"textarea">;

export function SettingsField({
  label,
  className,
  inputClassName,
  ...props
}: SettingsFieldProps) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-label">
        {label}
      </span>
      <Input
        {...props}
        className={cn(
          "archive-input h-9 rounded-none border-0 border-b border-dashed border-label/80 bg-transparent px-0 py-1 font-mono text-sm text-ink shadow-none focus-visible:border-accent-orange focus-visible:ring-0 disabled:opacity-55",
          inputClassName,
        )}
      />
    </label>
  );
}

export function SettingsTextarea({
  label,
  className,
  textareaClassName,
  ...props
}: SettingsTextareaProps) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-label">
        {label}
      </span>
      <textarea
        {...props}
        className={cn(
          "archive-input min-h-32 w-full resize-y border border-black/10 bg-paper px-4 py-3 font-display text-lg leading-8 text-ink outline-none placeholder:text-label/55 focus:border-accent-orange",
          textareaClassName,
        )}
      />
    </label>
  );
}
