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
	return (
		<AuthPaperCard
			className="lg:absolute lg:inset-y-0 lg:right-12 lg:w-1/2 lg:rotate-2"
			contentClassName="px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12"
			tapeTone="accent-red"
		>
			<AuthCardHeader
				eyebrow="Form 4B - Credential Application"
				title="Access Entry"
				subtitle="APP_ID: New_Access_V1"
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
					label="Username"
					placeholder="john_doe"
					value={username}
					onChange={onUsernameChange}
					required
					errorText={usernameError}
				/>

				<FieldInput
					type="email"
					label="Email"
					placeholder="login@student.42.fr"
					value={email}
					onChange={onEmailChange}
					required
					errorText={emailError}
				/>

				<FieldInput
					type="password"
					label="Password"
					placeholder="••••••••"
					value={password}
					onChange={onPasswordChange}
					required
					errorText={passwordError}
				/>

				<div className="mt-auto pt-6">
					<AuthFormMeta
						dateLabel={dateLabel}
						locationLabel="Encrypted_Port"
						action={
							<StampButton
								type="submit"
								form="register-form"
								disabled={loading}
								className="absolute right-0 bottom-8 sm:right-2 lg:bottom-9"
							>
								{loading ? "..." : "Register"}
							</StampButton>
						}
					/>

					<AuthProvidersRow>
						<OAuthProviderButton
							label="42"
							icon={<FortyTwoIcon className="h-4 w-4" />}
							href={fortyTwoHref}
						/>
						<OAuthProviderButton
							label="GitHub"
							icon={<GithubIcon className="h-4 w-4" />}
							href={githubHref}
						/>
					</AuthProvidersRow>
				</div>
			</form>
		</AuthPaperCard>
	);
}
