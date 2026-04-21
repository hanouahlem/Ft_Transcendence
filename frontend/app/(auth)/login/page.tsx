"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
	loginUser,
	resendLoginTwoFactorCode,
	verifyLoginTwoFactorCode,
} from "@/lib/api";
import LoginPaperCard from "@/components/auth/login/LoginPaperCard";
import TwoFactorCodeDialog from "@/components/auth/shared/TwoFactorCodeDialog";
import AuthPageShell from "@/components/auth/shared/AuthPageShell";
import { archiveToaster } from "@/components/ui/toaster";
import { useAuth } from "@/context/AuthContext";
import { LocaleSwitcher } from "@/i18n/LocaleSwitcher";
import { useI18n } from "@/i18n/I18nProvider";

const GITHUB_OAUTH_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/github`;
const FORTYTWO_OAUTH_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/42`;

export default function LoginPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { login, isLoggedIn, isAuthLoading } = useAuth();
	const { isRtl, t, locale } = useI18n();

	const [identifier, setIdentifier] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [identifierError, setIdentifierError] = useState("");
	const [passwordError, setPasswordError] = useState("");
	const [twoFactorDialogOpen, setTwoFactorDialogOpen] = useState(false);
	const [twoFactorPendingToken, setTwoFactorPendingToken] = useState<string | null>(null);
	const [twoFactorEmail, setTwoFactorEmail] = useState("");
	const [twoFactorCodeSent, setTwoFactorCodeSent] = useState(false);
	const [twoFactorAutoSendAttempted, setTwoFactorAutoSendAttempted] = useState(false);
	const [twoFactorMessage, setTwoFactorMessage] = useState<string | null>(null);
	const [twoFactorConfirming, setTwoFactorConfirming] = useState(false);
	const [twoFactorSending, setTwoFactorSending] = useState(false);

	useEffect(() => {
		if (!isAuthLoading && isLoggedIn) {
			router.replace("/feed");
		}
	}, [isAuthLoading, isLoggedIn, router]);

	useEffect(() => {
		const oauthError = searchParams.get("error");

		if (oauthError) {
			archiveToaster.error({
				title: t("common.error"),
				description: oauthError,
				duration: 6000,
			});
		}
	}, [searchParams]);

	const dateLabel = new Date()
		.toLocaleDateString("en-US", {
			month: "short",
			day: "2-digit",
			year: "numeric",
		})
		.toUpperCase();

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIdentifierError("");
		setPasswordError("");

		const trimmedIdentifier = identifier.trim();
		const nextIdentifierError = trimmedIdentifier
			? ""
			: t("auth.login.errors.required");
		const nextPasswordError = password
			? ""
			: t("auth.login.errors.required");

		if (nextIdentifierError || nextPasswordError) {
			setIdentifierError(nextIdentifierError);
			setPasswordError(nextPasswordError);
			return;
		}

		setLoading(true);

		try {
			const result = await loginUser({
				identifier: trimmedIdentifier,
				password,
			});

			if (!result.ok) {
				if (result.fieldErrors?.identifier) {
					setIdentifierError(result.fieldErrors.identifier);
				}
				if (result.fieldErrors?.password) {
					setPasswordError(result.fieldErrors.password);
				}
				if (
					!result.fieldErrors?.identifier &&
					!result.fieldErrors?.password
				) {
					archiveToaster.error({
						title: t("common.error"),
						description: result.message,
						duration: 6000,
					});
				}
				return;
			}

			if ("twoFactorRequired" in result.data && result.data.twoFactorRequired) {
				setTwoFactorPendingToken(result.data.pendingToken);
				setTwoFactorEmail(result.data.email);
				setTwoFactorCodeSent(false);
				setTwoFactorAutoSendAttempted(false);
				setTwoFactorMessage("Sending your 4-digit verification code...");
				setTwoFactorDialogOpen(true);
				return;
			}

			if ("token" in result.data && result.data.token) {
				const loginSucceeded = await login(result.data.token);

				if (!loginSucceeded) {
					archiveToaster.error({
						title: t("common.error"),
						description: t("auth.login.errors.failedLoading"),
						duration: 6000,
					});
					return;
				}

				router.push("/feed");
				return;
			}

			archiveToaster.error({
				title: t("common.error"),
				description: t("auth.login.errors.tokenMissing"),
				duration: 6000,
			});
		} finally {
			setLoading(false);
		}
	};

	const handleTwoFactorDialogOpenChange = (open: boolean) => {
		setTwoFactorDialogOpen(open);

		if (!open) {
			setTwoFactorPendingToken(null);
			setTwoFactorEmail("");
			setTwoFactorCodeSent(false);
			setTwoFactorAutoSendAttempted(false);
			setTwoFactorMessage(null);
		}
	};

	const handleConfirmTwoFactorLogin = async (code: string) => {
		if (!twoFactorPendingToken) {
			archiveToaster.error({
				title: "Error",
				description: "2FA session is missing. Please login again.",
				duration: 6000,
			});
			setTwoFactorDialogOpen(false);
			return;
		}

		if (!twoFactorCodeSent) {
			archiveToaster.error({
				title: "Error",
				description: "Send a code first.",
				duration: 4000,
			});
			return;
		}

		try {
			setTwoFactorConfirming(true);

			const result = await verifyLoginTwoFactorCode(twoFactorPendingToken, code);

			if (!result.ok) {
				throw new Error(result.message || "Unable to confirm 2FA code.");
			}

			const loginSucceeded = await login(result.data.token);

			if (!loginSucceeded) {
				throw new Error("Login failed while loading your account.");
			}

			setTwoFactorDialogOpen(false);
			setTwoFactorPendingToken(null);
			setTwoFactorEmail("");
			setTwoFactorMessage(null);
			router.push("/feed");
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to confirm 2FA code.";
			setTwoFactorMessage(message);
			archiveToaster.error({
				title: "Error",
				description: message,
				duration: 6000,
			});
		} finally {
			setTwoFactorConfirming(false);
		}
	};

	const handleSendLoginTwoFactorCode = useCallback(async () => {
		if (!twoFactorPendingToken) {
			archiveToaster.error({
				title: "Error",
				description: "2FA session is missing. Please login again.",
				duration: 6000,
			});
			setTwoFactorDialogOpen(false);
			return;
		}

		try {
			setTwoFactorSending(true);

			const result = await resendLoginTwoFactorCode(twoFactorPendingToken);

			if (!result.ok) {
				throw new Error(result.message || "Unable to resend 2FA code.");
			}

			setTwoFactorCodeSent(true);
			setTwoFactorEmail(result.data.email);
			setTwoFactorMessage(result.data.message);
			archiveToaster.success({
				title: "Code sent",
				description: result.data.message,
				duration: 4500,
			});
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to resend 2FA code.";
			setTwoFactorMessage(message);
			archiveToaster.error({
				title: "Error",
				description: message,
				duration: 6000,
			});
		} finally {
			setTwoFactorSending(false);
		}
	}, [twoFactorPendingToken]);

	useEffect(() => {
		if (
			!twoFactorDialogOpen ||
			twoFactorCodeSent ||
			twoFactorSending ||
			twoFactorAutoSendAttempted
		) {
			return;
		}

		setTwoFactorAutoSendAttempted(true);
		void handleSendLoginTwoFactorCode();
	}, [
		handleSendLoginTwoFactorCode,
		twoFactorAutoSendAttempted,
		twoFactorCodeSent,
		twoFactorDialogOpen,
		twoFactorSending,
	]);

	if (isAuthLoading || isLoggedIn) {
		return null;
	}

	return (
		<>
			<AuthPageShell
			panelAlign="right"
			footer={
				<p className="inline-block border border-label/20 bg-paper-muted px-4 py-2 font-mono text-[11px] uppercase tracking-[0.3em] text-ink/65">
					{t("auth.login.footerPrefix")}
					<Link
						href="/register"
						className="font-bold text-accent-red underline decoration-dotted underline-offset-4"
						style={{ marginInlineStart: "0.5rem" }}
					>
						{t("auth.login.footerLink")}
					</Link>
				</p>
			}
		>
			<LoginPaperCard
				identifier={identifier}
				password={password}
				loading={loading}
				identifierError={identifierError}
				passwordError={passwordError}
				dateLabel={dateLabel}
				fortyTwoHref={FORTYTWO_OAUTH_URL}
				githubHref={GITHUB_OAUTH_URL}
				onEmailChange={(event) => {
					setIdentifier(event.target.value);
					setIdentifierError("");
				}}
				onPasswordChange={(event) => {
					setPassword(event.target.value);
					setPasswordError("");
				}}
				onSubmit={handleSubmit}
			/>
			</AuthPageShell>

			<TwoFactorCodeDialog
				open={twoFactorDialogOpen}
				onOpenChange={handleTwoFactorDialogOpenChange}
				title="Two-Factor Login"
				subtitle="Authentication Checkpoint / Step 2"
				email={twoFactorEmail || "Unknown email"}
				codeSent={twoFactorCodeSent}
				confirming={twoFactorConfirming}
				sending={twoFactorSending}
				message={twoFactorMessage}
				onConfirm={handleConfirmTwoFactorLogin}
				onSendCode={handleSendLoginTwoFactorCode}
			/>
		</>
	);
}
