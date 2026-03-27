"use client";

import Link from "next/link";
import { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import {
  ArrowLeft,
  Shield,
  Lock,
  KeyRound,
  Smartphone,
  Bell,
  User,
  CheckCircle2,
  AlertTriangle,
  Leaf,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

export default function SettingsSecurityPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [showSetup, setShowSetup] = useState(false);

  const [passwordMessage, setPasswordMessage] = useState("");
  const [securityMessage, setSecurityMessage] = useState("");

  const handleChangePassword = async () => {
    setPasswordMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage("New password and confirmation do not match.");
      return;
    }

    try {
      // TODO: brancher ton API ici
      // await changePassword({ currentPassword, newPassword });

      await new Promise((resolve) => setTimeout(resolve, 800));
      setPasswordMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error(error);
      setPasswordMessage("Unable to update password.");
    }
  };

  const handleToggleTwoFactor = (checked: boolean) => {
    if (checked) {
      setShowSetup(true);
      setSecurityMessage("");
      return;
    }

    setTwoFactorEnabled(false);
    setShowSetup(false);
    setTwoFactorCode("");
    setSecurityMessage("Two-factor authentication has been disabled.");
  };

  const handleConfirmTwoFactor = async () => {
    if (!twoFactorCode.trim()) {
      setSecurityMessage("Enter the verification code to activate 2FA.");
      return;
    }

    try {
      // TODO: brancher ton API ici
      // await enableTwoFactor({ code: twoFactorCode });

      await new Promise((resolve) => setTimeout(resolve, 800));
      setTwoFactorEnabled(true);
      setShowSetup(false);
      setTwoFactorCode("");
      setSecurityMessage("Two-factor authentication is now enabled.");
    } catch (error) {
      console.error(error);
      setSecurityMessage("Unable to enable two-factor authentication.");
    }
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-screen bg-[#f6f1e8] text-[#2f3a32]">
        <section className="relative overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(125,148,112,0.16),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(216,207,184,0.32),transparent_30%)]" />

          <div className="relative mx-auto max-w-6xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                asChild
                variant="outline"
                className="rounded-full border-[#d8cfbe] bg-[#fffaf2]"
              >
                <Link href="/profile">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to profile
                </Link>
              </Button>
            </div>

            <Card className="rounded-[2rem] border-[#ddd3c2] bg-[#fffaf2]/95 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-2xl">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d8cfbe] bg-[#eef3e8] px-4 py-2 text-sm font-medium text-[#64785f]">
                      <Leaf className="h-4 w-4" />
                      Account settings
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-[#2f3a32] md:text-4xl">
                      Security settings
                    </h1>

                    <p className="mt-3 text-sm leading-7 text-[#667066] md:text-base">
                      Manage your password, two-factor authentication, and
                      sensitive account protections.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      asChild
                      variant="outline"
                      className="rounded-full border-[#d8cfbe] bg-[#fffaf2]"
                    >
                      <Link href="/settings/profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      className="rounded-full border-[#d8cfbe] bg-[#fffaf2]"
                    >
                      <Link href="/settings/notifications">
                        <Bell className="mr-2 h-4 w-4" />
                        Notifications
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {securityMessage && (
              <div className="rounded-2xl border border-[#c7d7bd] bg-[#edf4e8] px-4 py-3 text-sm text-[#5f7358]">
                {securityMessage}
              </div>
            )}

            <div className="grid gap-6">
              <Card className="rounded-[2rem] border-[#ddd3c2] bg-[#fffaf2]/95 shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-6 flex items-start gap-3">
                    <div className="rounded-2xl bg-[#eef3e8] p-3 text-[#6f8467]">
                      <Lock className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-[#2f3a32]">
                        Change password
                      </h2>
                      <p className="mt-2 text-sm text-[#667066]">
                        Use a strong password with letters, numbers, and special
                        characters.
                      </p>
                    </div>
                  </div>

                  {passwordMessage && (
                    <div className="mb-5 rounded-2xl border border-[#d8cfbe] bg-[#faf5eb] px-4 py-3 text-sm text-[#5d675e]">
                      {passwordMessage}
                    </div>
                  )}

                  <div className="grid gap-5 md:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#5d675e]">
                        Current password
                      </label>
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="rounded-2xl border-[#d8cfbe] bg-[#fcf8f1]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#5d675e]">
                        New password
                      </label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="rounded-2xl border-[#d8cfbe] bg-[#fcf8f1]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#5d675e]">
                        Confirm password
                      </label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="rounded-2xl border-[#d8cfbe] bg-[#fcf8f1]"
                      />
                    </div>
                  </div>

                  <div className="mt-5">
                    <Button
                      onClick={handleChangePassword}
                      className="rounded-full bg-[#6f8467] text-white hover:bg-[#5f7358]"
                    >
                      <KeyRound className="mr-2 h-4 w-4" />
                      Update password
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border-[#ddd3c2] bg-[#fffaf2]/95 shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-[#eef3e8] p-3 text-[#6f8467]">
                        <Shield className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-semibold text-[#2f3a32]">
                          Two-factor authentication
                        </h2>
                        <p className="mt-2 text-sm text-[#667066]">
                          Add an extra security layer to your account with an
                          authenticator app.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm text-[#667066]">
                        {twoFactorEnabled ? "Enabled" : "Disabled"}
                      </span>
                      <Switch
                        checked={twoFactorEnabled || showSetup}
                        onCheckedChange={handleToggleTwoFactor}
                      />
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-[#d8cfbe] bg-[#faf5eb] p-5">
                    <div className="flex items-start gap-3">
                      {twoFactorEnabled ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#6f8467]" />
                      ) : (
                        <AlertTriangle className="mt-0.5 h-5 w-5 text-[#8a7a5d]" />
                      )}

                      <div>
                        <p className="font-semibold text-[#2f3a32]">
                          {twoFactorEnabled
                            ? "Your account is protected by 2FA."
                            : "2FA is currently not active."}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[#667066]">
                          Once enabled, you will need a one-time code from your
                          authenticator app when signing in.
                        </p>
                      </div>
                    </div>
                  </div>

                  {showSetup && !twoFactorEnabled && (
                    <>
                      <Separator className="my-6 bg-[#e5dccd]" />

                      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
                        <div className="rounded-[1.5rem] border border-dashed border-[#cbbfae] bg-[#fcf8f1] p-6">
                          <div className="flex h-56 items-center justify-center rounded-[1.25rem] border border-[#d8cfbe] bg-white text-center text-sm text-[#7b847b]">
                            QR code placeholder
                            <br />
                            Branch your backend QR here
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-semibold text-[#2f3a32]">
                              Setup steps
                            </p>
                            <div className="mt-3 space-y-3 text-sm text-[#667066]">
                              <p>1. Scan the QR code with your authenticator app.</p>
                              <p>2. Enter the 6-digit code generated by the app.</p>
                              <p>3. Confirm activation.</p>
                            </div>
                          </div>

                          <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#5d675e]">
                              <Smartphone className="h-4 w-4" />
                              Verification code
                            </label>
                            <Input
                              value={twoFactorCode}
                              onChange={(e) => setTwoFactorCode(e.target.value)}
                              placeholder="123456"
                              className="rounded-2xl border-[#d8cfbe] bg-[#fcf8f1]"
                            />
                          </div>

                          <Button
                            onClick={handleConfirmTwoFactor}
                            className="rounded-full bg-[#6f8467] text-white hover:bg-[#5f7358]"
                          >
                            Confirm 2FA
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border-[#d8cfbe] bg-[#eef3e8]/80 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-[#2f3a32]">
                    Next backend step
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#667066]">
                    For real 2FA, your backend will usually generate a secret,
                    return a QR code, verify the code entered by the user, then
                    store the 2FA status safely in the database.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}