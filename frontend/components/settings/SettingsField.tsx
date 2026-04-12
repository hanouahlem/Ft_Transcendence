"use client";

import type { ComponentProps } from "react";
import { PasswordInput } from "@ark-ui/react/password-input";
import { ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
  type,
  ...props
}: SettingsFieldProps) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-label">
        {label}
      </span>
      {type === "password" ? (
        <PasswordInput.Root>
          <div className="relative">
            <PasswordInput.Input
              {...props}
              className={cn(
                "archive-input h-9 w-full rounded-none border-0 border-b border-dashed border-label/80 bg-transparent px-0 py-1 pr-16 font-mono text-sm text-ink tracking-[0.1em] shadow-none placeholder:text-label/40 focus:border-accent-orange focus-visible:ring-0 disabled:opacity-55",
                inputClassName,
              )}
            />
            <PasswordInput.VisibilityTrigger
              type="button"
              className="absolute right-0 top-1/2 -translate-y-1/2 text-accent-orange hover:text-ink"
            >
              <PasswordInput.Indicator
                fallback={<HugeiconsIcon icon={ViewOffIcon} size={16} strokeWidth={1.9} />}
              >
                <HugeiconsIcon icon={ViewIcon} size={16} strokeWidth={1.9} />
              </PasswordInput.Indicator>
            </PasswordInput.VisibilityTrigger>
          </div>
        </PasswordInput.Root>
      ) : (
        <Input
          {...props}
          type={type}
          className={cn(
            "archive-input h-9 rounded-none border-0 border-b border-dashed border-label/80 bg-transparent px-0 py-1 font-mono text-sm text-ink shadow-none placeholder:text-label/40 focus-visible:border-accent-orange focus-visible:ring-0 disabled:opacity-55",
            inputClassName,
          )}
        />
      )}
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
          "archive-input min-h-53 w-full resize-y border-b-2 border-black/10 bg-[#f5f2eb] px-4 py-3 font-display text-lg leading-8 text-ink outline-none placeholder:text-label/40 focus:border-accent-orange",
          textareaClassName,
        )}
      />
    </label>
  );
}
