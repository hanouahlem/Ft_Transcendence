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

type RegisterPaperCardProps = {
	username: string;
	email: string;
	password: string;
	loading: boolean;
	usernameError?: string;
	emailError?: string;
	passwordError?: string;
	dateLabel: string;
	fortyTwoHref: string;
	githubHref: string;
	onUsernameChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onEmailChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onPasswordChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function RegisterPaperCard({
	username,
	email,
	password,
	loading,
	usernameError,
	emailError,
	passwordError,
	dateLabel,
	fortyTwoHref,
	githubHref,
	onUsernameChange,
	onEmailChange,
	onPasswordChange,
	onSubmit,
}: RegisterPaperCardProps) {
	const { isRtl, t } = useI18n();
	const cardClassName = isRtl
		? "lg:absolute lg:inset-y-0 lg:left-12 lg:w-1/2 lg:-rotate-2"
		: "lg:absolute lg:inset-y-0 lg:right-12 lg:w-1/2 lg:rotate-2";
	const topTapeClassName = isRtl
		? "-top-3 left-[24%] h-8 w-32 -rotate-3"
		: "-top-3 right-[24%] h-8 w-32 -rotate-3";
	const bottomTapeClassName = isRtl
		? "-bottom-2 right-[24%] h-6 w-24 rotate-2"
		: "-bottom-2 left-[24%] h-6 w-24 rotate-2";

	return (
		<AuthPaperCard
			className={cardClassName}
			contentClassName="px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12"
			topTapeClassName={topTapeClassName}
			bottomTapeClassName={bottomTapeClassName}
			tapeTone="accent-red"
		>
			<AuthCardHeader
				eyebrow={t("auth.register.eyebrow")}
				title={t("auth.register.title")}
				subtitle={t("auth.register.subtitle")}
				decoration={<WaxSeal />}
			/>

			<form
				id="register-form"
				onSubmit={onSubmit}
				noValidate
				className="flex flex-1 flex-col gap-8"
			>
				<FieldInput
					type="text"
					label={t("auth.register.usernameLabel")}
					placeholder={t("auth.register.usernamePlaceholder")}
					value={username}
					onChange={onUsernameChange}
					required
					errorText={usernameError}
				/>

				<FieldInput
					type="email"
					label={t("auth.register.emailLabel")}
					placeholder={t("auth.register.emailPlaceholder")}
					value={email}
					onChange={onEmailChange}
					required
					errorText={emailError}
				/>

				<FieldInput
					type="password"
					label={t("auth.register.passwordLabel")}
					placeholder="••••••••"
					value={password}
					onChange={onPasswordChange}
					required
					errorText={passwordError}
				/>

				<div className="mt-auto pt-6">
					<AuthFormMeta
						dateLabel={dateLabel}
						locationLabel={t("auth.register.dateLocation")}
						action={
							<StampButton
								type="submit"
								form="register-form"
								disabled={loading}
								className="absolute bottom-8 sm:bottom-9"
								style={{ insetInlineEnd: isRtl ? undefined : "0rem", insetInlineStart: isRtl ? "0rem" : undefined }}
							>
								{loading ? "..." : t("auth.register.submit")}
							</StampButton>
						}
					/>

					<AuthProvidersRow label={t("auth.register.providerLabel")}>
						<OAuthProviderButton
							label={t("auth.register.providerTwo")}
							icon={<FortyTwoIcon className="h-4 w-4" />}
							href={fortyTwoHref}
						/>
						<OAuthProviderButton
							label={t("auth.register.providerGithub")}
							icon={<GithubIcon className="h-4 w-4" />}
							href={githubHref}
						/>
					</AuthProvidersRow>
				</div>
			</form>
		</AuthPaperCard>
	);
}
