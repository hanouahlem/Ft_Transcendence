"use client";

import { ResetPasswordIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { SettingsField } from "@/components/settings/SettingsField";

type SettingsPasswordSectionProps = {
  hasPassword: boolean;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  saving: boolean;
  message?: string | null;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: () => void;
};

export function SettingsPasswordSection({
  hasPassword,
  currentPassword,
  newPassword,
  confirmPassword,
  saving,
  message,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}: SettingsPasswordSectionProps) {
  return (
    <div>
      <div
        className={
          hasPassword
            ? "grid gap-4 md:grid-cols-[repeat(3,minmax(0,1fr))_auto] md:items-end"
            : "grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end"
        }
      >
        {hasPassword ? (
          <>
            <SettingsField
              label="Current password"
              type="password"
              value={currentPassword}
              onChange={(event) => onCurrentPasswordChange(event.target.value)}
              autoComplete="current-password"
            />
            <SettingsField
              label="New password"
              type="password"
              value={newPassword}
              onChange={(event) => onNewPasswordChange(event.target.value)}
              autoComplete="new-password"
            />
            <SettingsField
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(event) => onConfirmPasswordChange(event.target.value)}
              autoComplete="new-password"
            />
          </>
        ) : (
          <SettingsField
            label="New password"
            type="password"
            value={newPassword}
            onChange={(event) => onNewPasswordChange(event.target.value)}
            autoComplete="new-password"
            placeholder="Enter a local password..."
          />
        )}

        <Button
          type="button"
          variant="bluesh"
          size="sm"
          className="rounded-none md:mb-0.5"
          onClick={onSubmit}
          disabled={saving}
        >
          <HugeiconsIcon icon={ResetPasswordIcon} size={18} strokeWidth={1.9} />
          {saving
            ? "Writing..."
            : hasPassword
              ? ""
              : "Set Password"}
        </Button>
      </div>

      {message ? (
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-label">
          {message}
        </p>
      ) : null}
    </div>
  );
}
