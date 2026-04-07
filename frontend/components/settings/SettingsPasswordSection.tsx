"use client";

import { KeyRound } from "lucide-react";
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
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-label">
            08. Password
          </span>
          <p className="text-sm text-label">
            {hasPassword
              ? "Change the local password attached to this archive account."
              : "This account has no local password yet. Set one now."}
          </p>
        </div>

        <Button
          type="button"
          variant="ledger"
          size="sm"
          className="rounded-none"
          onClick={onSubmit}
          disabled={saving}
        >
          <KeyRound className="h-3.5 w-3.5" />
          {saving ? "Writing..." : hasPassword ? "Change Password" : "Set Password"}
        </Button>
      </div>

      {hasPassword ? (
        <div className="grid gap-4 md:grid-cols-3">
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
        </div>
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

      {message ? (
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-label">
          {message}
        </p>
      ) : null}
    </div>
  );
}
