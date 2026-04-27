"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
	Suspense,
	useCallback,
	useEffect,
	useState,
	type FormEvent,
} from "react";
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

const OAUTH_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function buildOAuthUrl(path: string) {
	try {
		return new URL(path, OAUTH_BASE_URL).toString();
	} catch {
		return `${OAUTH_BASE_URL}${path}`;
	}
}

const GITHUB_OAUTH_URL = buildOAuthUrl("/auth/github");
const FORTYTWO_OAUTH_URL = buildOAuthUrl("/auth/42");

function LoginPageContent() {
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

	const mapLoginErrorMessage = useCallback(
		(message?: string | null) => {
			if (!message) {
				return "";
			}

			switch (message) {
				case "Username/email or password is incorrect.":
					return t("auth.login.errors.invalidCredentials");
				case "Login credentials are required.":
					return t("auth.login.errors.required");
				default:
					return message;
			}
		},
		[t],
	);

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
		.toLocaleDateString(locale, {
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
				const identifierFieldError = mapLoginErrorMessage(result.fieldErrors?.identifier);
				const passwordFieldError = mapLoginErrorMessage(result.fieldErrors?.password);

				if (identifierFieldError) {
					setIdentifierError(identifierFieldError);
				}
				if (passwordFieldError) {
					setPasswordError(passwordFieldError);
				}
				if (
					!identifierFieldError &&
					!passwordFieldError
				) {
					archiveToaster.error({
						title: t("common.error"),
						description: mapLoginErrorMessage(result.message),
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
				setTwoFactorMessage(t("auth.login.twoFactor.sendingMessage"));
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
				title: t("common.error"),
				description: t("auth.login.twoFactor.errors.sessionMissing"),
				duration: 6000,
			});
			setTwoFactorDialogOpen(false);
			return;
		}

		if (!twoFactorCodeSent) {
			archiveToaster.error({
				title: t("common.error"),
				description: t("auth.login.twoFactor.errors.sendFirst"),
				duration: 4000,
			});
			return;
		}

		try {
			setTwoFactorConfirming(true);

			const result = await verifyLoginTwoFactorCode(twoFactorPendingToken, code);

			if (!result.ok) {
				throw new Error(result.message || t("auth.login.twoFactor.errors.confirm"));
			}

			const loginSucceeded = await login(result.data.token);

			if (!loginSucceeded) {
				throw new Error(t("auth.login.errors.failedLoading"));
			}

			setTwoFactorDialogOpen(false);
			setTwoFactorPendingToken(null);
			setTwoFactorEmail("");
			setTwoFactorMessage(null);
			router.push("/feed");
		} catch (error) {
			const message =
				error instanceof Error ? error.message : t("auth.login.twoFactor.errors.confirmFallback");
			setTwoFactorMessage(message);
			archiveToaster.error({
				title: t("common.error"),
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
				title: t("common.error"),
				description: t("auth.login.twoFactor.errors.sessionMissing"),
				duration: 6000,
			});
			setTwoFactorDialogOpen(false);
			return;
		}

		try {
			setTwoFactorSending(true);

			const result = await resendLoginTwoFactorCode(twoFactorPendingToken);

			if (!result.ok) {
				throw new Error(result.message || t("auth.login.twoFactor.errors.resend"));
			}

			setTwoFactorCodeSent(true);
			setTwoFactorEmail(result.data.email);
			setTwoFactorMessage(t("auth.login.twoFactor.codeSentByEmail"));
			archiveToaster.success({
				title: t("auth.login.twoFactor.codeSent"),
				description: t("auth.login.twoFactor.codeSentByEmail"),
				duration: 4500,
			});
		} catch (error) {
			const message =
				error instanceof Error ? error.message : t("auth.login.twoFactor.errors.resendFallback");
			setTwoFactorMessage(message);
			archiveToaster.error({
				title: t("common.error"),
				description: message,
				duration: 6000,
			});
		} finally {
			setTwoFactorSending(false);
		}
	}, [t, twoFactorPendingToken]);

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
			localeSwitcher={<LocaleSwitcher />}
			panelAlign={isRtl ? "left" : "right"}
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
				title={t("auth.login.twoFactor.title")}
				subtitle={t("auth.login.twoFactor.subtitle")}
				email={twoFactorEmail || t("auth.login.twoFactor.unknownEmail")}
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

export default function LoginPage() {
	return (
		<Suspense fallback={null}>
			<LoginPageContent />
		</Suspense>
	);
}
