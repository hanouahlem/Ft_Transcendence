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
	return (
		<AuthPaperCard
			className="lg:absolute lg:inset-y-0 lg:left-12 lg:w-1/2 lg:-rotate-2"
			contentClassName="px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12"
		>
			<AuthCardHeader
				eyebrow="Form 4A - Authorized Personnel"
				title="Login Entry"
				subtitle="Log_ID: Secure_Entry_V4"
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
					label="Username / Email"
					placeholder="login@student.42.fr"
					value={identifier}
					onChange={onEmailChange}
					required
					errorText={identifierError}
				/>

				<FieldInput
					type="password"
					label="Password"
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
								Forgot Password?
							</button>
						) : undefined
					}
				/>

				<div className="mt-auto pt-6">
					<AuthFormMeta
						dateLabel={dateLabel}
						locationLabel="Encrypted_Port"
						action={
							<StampButton
								type="submit"
								form="login-form"
								disabled={loading}
								textClassName="text-5xl"
								className="absolute right-0 bottom-8 sm:right-2 lg:bottom-9"
							>
								{loading ? "..." : "Login"}
							</StampButton>
						}
					/>

					<AuthProvidersRow>
						<OAuthProviderButton
							label="Intra"
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
