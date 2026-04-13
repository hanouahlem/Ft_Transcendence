"use client";

import { forwardRef, useRef, type KeyboardEvent } from "react";
import { Field } from "@ark-ui/react/field";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SocialComposerProps = {
  value: string;
  submitting?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void | Promise<void>;
  placeholder?: string;
  label: string;
  submitLabel: string;
  containerClassName?: string;
  textareaClassName?: string;
  showThread?: boolean;
  multiline?: boolean;
  submitOnEnter?: boolean;
  keepFocusOnSubmit?: boolean;
  rows?: number;
  maxLength?: number;
  disabled?: boolean;
};

export const SocialComposer = forwardRef<HTMLTextAreaElement, SocialComposerProps>(
  function SocialComposer(
    {
      value,
      submitting = false,
      onChange,
      onSubmit,
      placeholder = "Write...",
      label,
      submitLabel,
      containerClassName,
      textareaClassName,
      showThread = true,
      multiline = true,
      submitOnEnter = true,
      keepFocusOnSubmit = false,
      rows = 1,
      maxLength,
      disabled = false,
    },
    forwardedRef,
  ) {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const isDisabled = disabled || submitting;
    const canSubmit = !isDisabled && value.trim().length > 0;

    const setTextareaRef = (node: HTMLTextAreaElement | null) => {
      textareaRef.current = node;

      if (typeof forwardedRef === "function") {
        forwardedRef(node);
        return;
      }

      if (forwardedRef) {
        forwardedRef.current = node;
      }
    };

    const focusComposer = () => {
      if (!keepFocusOnSubmit) {
        return;
      }

      let attempts = 0;

      const tryFocus = () => {
        const textarea = textareaRef.current;

        if (!textarea) {
          return;
        }

        if (textarea.disabled && attempts < 8) {
          attempts += 1;
          requestAnimationFrame(tryFocus);
          return;
        }

        textarea.focus();
        const valueLength = textarea.value.length;
        textarea.setSelectionRange(valueLength, valueLength);
      };

      requestAnimationFrame(tryFocus);
    };

    const submitAndMaybeRefocus = () => {
      if (!canSubmit) {
        return;
      }

      Promise.resolve(onSubmit()).finally(() => {
        focusComposer();
      });
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (!submitOnEnter) {
        return;
      }

      if (event.key !== "Enter" || event.nativeEvent.isComposing) {
        return;
      }

      if (multiline && event.shiftKey) {
        return;
      }

      event.preventDefault();
      submitAndMaybeRefocus();
    };

    return (
      <section
        className={cn(
          "relative overflow-hidden border border-black/10 bg-paper-muted px-3 py-3",
          containerClassName,
        )}
      >
        {showThread ? <div className="archive-thread hidden sm:block" /> : null}
        <div className={cn("flex items-end gap-3", showThread ? "sm:pl-8" : "")}>
          <Field.Root className="flex-1">
            <Field.Label className="sr-only">{label}</Field.Label>
            <Field.Textarea
              ref={setTextareaRef}
              autoresize={multiline}
              rows={rows}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isDisabled}
              maxLength={maxLength}
              className={cn(
                "archive-input archive-lines min-h-11 w-full resize-none border-0 bg-transparent p-0 text-sm leading-6 text-ink",
                textareaClassName,
              )}
            />
          </Field.Root>

          <div className="shrink-0">
            <Button
              type="button"
              variant="bluesh"
              onClick={submitAndMaybeRefocus}
              disabled={!canSubmit}
              aria-label={submitLabel}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    );
  },
);
