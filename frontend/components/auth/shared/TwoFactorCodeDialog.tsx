"use client";

import { PinInput as ArkPinInput } from "@ark-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

type TwoFactorCodeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle: string;
  email: string;
  codeSent: boolean;
  confirming: boolean;
  sending: boolean;
  message?: string | null;
  onConfirm: (code: string) => void | Promise<void>;
  onSendCode: () => void | Promise<void>;
};

const EMPTY_PIN = ["", "", "", ""];

export default function TwoFactorCodeDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  email,
  codeSent,
  confirming,
  sending,
  message,
  onConfirm,
  onSendCode,
}: TwoFactorCodeDialogProps) {
  const [pinValue, setPinValue] = useState<string[]>(EMPTY_PIN);
  const code = useMemo(() => pinValue.join(""), [pinValue]);
  const canConfirm = codeSent && /^\d{4}$/.test(code) && !confirming;
  const submitCode = useCallback(() => {
    if (!canConfirm) {
      return;
    }

    void onConfirm(code);
  }, [canConfirm, code, onConfirm]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEnterSubmit = (event: KeyboardEvent) => {
      if (event.key !== "Enter" || !canConfirm) {
        return;
      }

      event.preventDefault();
      submitCode();
    };

    window.addEventListener("keydown", handleEnterSubmit);
    return () => {
      window.removeEventListener("keydown", handleEnterSubmit);
    };
  }, [canConfirm, open, submitCode]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="archive-paper max-w-[560px] border border-black/10 p-0">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{subtitle}</DialogDescription>

        <div className="p-6 sm:p-8">
          <header className="mb-6 border-b border-black/10 pb-4">
            <h2 className="font-display text-3xl font-black uppercase tracking-[-0.04em] text-ink">
              {title}
            </h2>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.24em] text-label">
              {subtitle}
            </p>
          </header>

          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.16em] text-label">
            {codeSent ? (
              <>
                We sent a 4-digit code to <span className="text-ink">{email}</span>.
              </>
            ) : sending ? (
              <>
                Sending a 4-digit code to <span className="text-ink">{email}</span>...
              </>
            ) : (
              <>
                Click <span className="text-ink">Send code</span> to receive a 4-digit code at{" "}
                <span className="text-ink">{email}</span>.
              </>
            )}
          </p>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              submitCode();
            }}
            autoComplete="off"
            className="space-y-5"
          >
            <ArkPinInput.Root
              value={pinValue}
              onValueChange={(details) => setPinValue(details.value)}
              count={4}
              name="two-factor-code"
              type="numeric"
              otp
              blurOnComplete
              autoFocus
            >
              <ArkPinInput.HiddenInput autoComplete="one-time-code" />
              <ArkPinInput.Control className="flex items-center justify-center gap-2 sm:gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <ArkPinInput.Input
                    key={index}
                    index={index}
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    data-lpignore="true"
                    data-1p-ignore="true"
                    onKeyDownCapture={(event) => {
                      if (event.key !== "Enter") {
                        return;
                      }

                      event.preventDefault();
                      submitCode();
                    }}
                    className="h-14 w-12 border border-black/20 bg-paper-muted text-center font-mono text-2xl tracking-[0.18em] text-ink outline-none transition focus:border-accent-red sm:h-16 sm:w-14"
                  />
                ))}
              </ArkPinInput.Control>
            </ArkPinInput.Root>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-label">
                {codeSent ? "Didn&apos;t receive it?" : "Ready to continue?"}{" "}
                <button
                  type="button"
                  className="text-accent-red underline decoration-dotted underline-offset-4 disabled:opacity-60"
                  onClick={() => void onSendCode()}
                  disabled={sending}
                >
                  {sending ? (codeSent ? "Resending..." : "Sending...") : codeSent ? "Resend code" : "Send code"}
                </button>
              </p>

              <Button
                type="submit"
                variant="paper"
                size="sm"
                className="rounded-none"
                disabled={!canConfirm}
              >
                {confirming ? "Confirming..." : "Confirm code"}
              </Button>
            </div>

            {message ? (
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-label">
                {message}
              </p>
            ) : null}
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
