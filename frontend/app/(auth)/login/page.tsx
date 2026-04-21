"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { loginUser } from "@/lib/api";
import LoginPaperCard from "@/components/auth/login/LoginPaperCard";
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

	if (isAuthLoading || isLoggedIn) {
		return null;
	}

	const dateLabel = new Date().toLocaleDateString(locale, {
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

			if (result.data.token) {
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

	return (
		<AuthPageShell
			panelAlign={isRtl ? "left" : "right"}
			localeSwitcher={<LocaleSwitcher compact />}
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
	);
}
