import type { ChangeEvent, FormEvent } from "react";
import OAuthProviderButton from "@/components/auth/OAuthProviderButton";
import { FortyTwoIcon, GithubIcon } from "@/components/auth/OAuthIcons";
import AuthCardHeader from "@/components/auth/shared/AuthCardHeader";
import AuthFormMeta from "@/components/auth/shared/AuthFormMeta";
import AuthPaperCard from "@/components/auth/shared/AuthPaperCard";
import AuthProvidersRow from "@/components/auth/shared/AuthProvidersRow";
import WaxSeal from "@/components/decor/WaxSeal";
import FieldInput from "@/components/ui/FieldInput";
import StampButton from "@/components/ui/StampButton";
import { useI18n } from "@/i18n/I18nProvider";

type LoginPaperCardProps = {
	identifier: string;
	password: string;
	loading: boolean;
	identifierError?: string;
	passwordError?: string;
	dateLabel: string;
	fortyTwoHref: string;
	githubHref: string;
	onEmailChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onPasswordChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function LoginPaperCard({
	identifier,
	password,
	loading,
	identifierError,
	passwordError,
	dateLabel,
	fortyTwoHref,
	githubHref,
	onEmailChange,
	onPasswordChange,
	onSubmit,
}: LoginPaperCardProps) {
	const { isRtl, t } = useI18n();
	const cardClassName = isRtl
		? "lg:absolute lg:inset-y-0 lg:right-12 lg:w-1/2 lg:rotate-2"
		: "lg:absolute lg:inset-y-0 lg:left-12 lg:w-1/2 lg:-rotate-2";
	const topTapeClassName = isRtl
		? "-top-3 right-[24%] h-8 w-32 -rotate-3"
		: "-top-3 left-[24%] h-8 w-32 -rotate-3";
	const bottomTapeClassName = isRtl
		? "-bottom-2 left-[24%] h-6 w-24 rotate-2"
		: "-bottom-2 right-[24%] h-6 w-24 rotate-2";

	return (
		<AuthPaperCard
			className={cardClassName}
			contentClassName="px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12"
			topTapeClassName={topTapeClassName}
			bottomTapeClassName={bottomTapeClassName}
		>
			<AuthCardHeader
				eyebrow={t("auth.login.eyebrow")}
				title={t("auth.login.title")}
				subtitle={t("auth.login.subtitle")}
				decoration={<WaxSeal />}
			/>

			<form
				id="login-form"
				onSubmit={onSubmit}
				noValidate
				className="flex flex-1 flex-col gap-8"
			>
				<FieldInput
					type="email"
					label={t("auth.login.usernameLabel")}
					placeholder={t("auth.login.usernamePlaceholder")}
					value={identifier}
					onChange={onEmailChange}
					required
					errorText={identifierError}
				/>

				<FieldInput
					type="password"
					label={t("auth.login.passwordLabel")}
					placeholder="••••••••"
					value={password}
					onChange={onPasswordChange}
					required
					errorText={passwordError}
					action={
						!passwordError ? (
							<button
								type="button"
								className="bg-paper px-1 font-mono text-[11px] uppercase tracking-[0.12em] text-accent-red underline decoration-dotted underline-offset-4"
							>
								{t("auth.login.forgotPassword")}
							</button>
						) : undefined
					}
				/>

				<div className="mt-auto pt-6">
					<AuthFormMeta
						dateLabel={dateLabel}
						locationLabel={t("auth.login.dateLocation")}
						action={
							<StampButton
								type="submit"
								form="login-form"
								disabled={loading}
								textClassName="text-5xl"
								className="absolute bottom-8 sm:bottom-9"
								style={{ insetInlineEnd: isRtl ? undefined : "0rem", insetInlineStart: isRtl ? "0rem" : undefined }}
							>
								{loading ? "..." : t("auth.login.submit")}
							</StampButton>
						}
					/>

					<AuthProvidersRow label={t("auth.login.providerLabel")}>
						<OAuthProviderButton
							label={t("auth.login.providerTwo")}
							icon={<FortyTwoIcon className="h-4 w-4" />}
							href={fortyTwoHref}
						/>
						<OAuthProviderButton
							label={t("auth.login.providerGithub")}
							icon={<GithubIcon className="h-4 w-4" />}
							href={githubHref}
						/>
					</AuthProvidersRow>
				</div>
			</form>
		</AuthPaperCard>
	);
}
