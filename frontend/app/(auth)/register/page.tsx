"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import RegisterPaperCard from "@/components/auth/register/RegisterPaperCard";
import AuthPageShell from "@/components/auth/shared/AuthPageShell";
import { archiveToaster } from "@/components/ui/toaster";
import { registerUser } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { LocaleSwitcher } from "@/i18n/LocaleSwitcher";
import { useI18n } from "@/i18n/I18nProvider";

const GITHUB_OAUTH_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/github`;
const FORTYTWO_OAUTH_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/42`;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
	const router = useRouter();
	const { isLoggedIn, isAuthLoading } = useAuth();
	const { isRtl, t, locale } = useI18n();

	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [usernameError, setUsernameError] = useState("");
	const [emailError, setEmailError] = useState("");
	const [passwordError, setPasswordError] = useState("");

	useEffect(() => {
		if (!isAuthLoading && isLoggedIn) {
			router.replace("/feed");
		}
	}, [isLoggedIn, isAuthLoading, router]);

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
		setUsernameError("");
		setEmailError("");
		setPasswordError("");

		const trimmedUsername = username.trim();
		const trimmedEmail = email.trim();
		const nextUsernameError = trimmedUsername ? "" : t("auth.register.errors.required");
		const nextEmailError = !trimmedEmail
			? t("auth.register.errors.required")
			: EMAIL_PATTERN.test(trimmedEmail)
				? ""
				: t("auth.register.errors.invalidEmail");
		const nextPasswordError = password ? "" : t("auth.register.errors.required");

		if (nextUsernameError || nextEmailError || nextPasswordError) {
			setUsernameError(nextUsernameError);
			setEmailError(nextEmailError);
			setPasswordError(nextPasswordError);
			return;
		}

		setLoading(true);

		try {
			const result = await registerUser({
				username: trimmedUsername,
				email: trimmedEmail,
				password,
			});

			if (!result.ok) {
				if (result.fieldErrors) {
					if (result.fieldErrors.username) {
						setUsernameError(result.fieldErrors.username);
					}
					if (result.fieldErrors.email) {
						setEmailError(result.fieldErrors.email);
					}
					if (result.fieldErrors.password) {
						setPasswordError(result.fieldErrors.password);
					}
					return;
				}

				archiveToaster.error({
					title: t("common.error"),
					description: result.message,
					duration: 6000,
				});
				return;
			}

			archiveToaster.success({
				title: t("common.fieldNotice"),
				description: t("auth.register.errors.created"),
			});
			setUsername("");
			setEmail("");
			setPassword("");
		} finally {
			setLoading(false);
		}
	};

	return (
		<AuthPageShell
			panelAlign={isRtl ? "right" : "left"}
			panelMainTone="accent-blue"
			panelAccentTone="accent-red"
			localeSwitcher={<LocaleSwitcher compact />}
			footer={
				<p className="inline-block border border-label/20 bg-paper-muted px-4 py-2 font-mono text-[11px] uppercase tracking-[0.3em] text-ink/65">
					{t("auth.register.footerPrefix")}
					<Link
						href="/login"
						className="font-bold text-accent-red underline decoration-dotted underline-offset-4"
						style={{ marginInlineStart: "0.5rem" }}
					>
						{t("auth.register.footerLink")}
					</Link>
				</p>
			}
		>
			<RegisterPaperCard
				username={username}
				email={email}
				password={password}
				loading={loading}
				usernameError={usernameError}
				emailError={emailError}
				passwordError={passwordError}
				dateLabel={dateLabel}
				fortyTwoHref={FORTYTWO_OAUTH_URL}
				githubHref={GITHUB_OAUTH_URL}
				onUsernameChange={(event) => {
					setUsername(event.target.value);
					setUsernameError("");
				}}
				onEmailChange={(event) => {
					setEmail(event.target.value);
					setEmailError("");
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
