import type { ChangeEvent, FormEvent } from "react";
import OAuthProviderButton from "@/components/auth/OAuthProviderButton";
import { FortyTwoIcon, GithubIcon } from "@/components/auth/OAuthIcons";
import ArchiveTape from "@/components/decor/ArchiveTape";
import WaxSeal from "@/components/decor/WaxSeal";
import MonoText from "@/components/typography/MonoText";
import FieldInput from "@/components/ui/FieldInput";
import StampButton from "@/components/ui/StampButton";

type LoginPaperCardProps = {
	email: string;
	password: string;
	loading: boolean;
	error: string;
	dateLabel: string;
	fortyTwoHref: string;
	githubHref: string;
	onEmailChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onPasswordChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function LoginPaperCard({
	email,
	password,
	loading,
	error,
	dateLabel,
	fortyTwoHref,
	githubHref,
	onEmailChange,
	onPasswordChange,
	onSubmit,
}: LoginPaperCardProps) {
	return (
		<section className="relative z-20 overflow-visible border border-paper-muted bg-paper shadow-[0_20px_50px_rgba(0,0,0,0.4)] lg:absolute lg:inset-y-0 lg:left-12 lg:w-1/2 lg:-rotate-2">
			<div
				className="pointer-events-none absolute inset-0 opacity-50"
				style={{
					backgroundImage:
						"radial-gradient(var(--color-paper-muted) 1px, transparent 1px)",
					backgroundSize: "16px 16px",
				}}
			/>

			<ArchiveTape className="-top-3 left-[24%] h-8 w-32 -rotate-3" />
			<ArchiveTape className="-bottom-2 right-[24%] h-6 w-24 rotate-2" />

			<div className="relative flex h-full flex-col px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
				<header className="mb-10 flex items-start justify-between gap-6">
					<div>
						<div className="mb-3 inline-block bg-ink px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-paper sm:text-[10px]">
							Form 4A - Authorized Personnel
						</div>
						<h2 className="font-display text-3xl font-black uppercase tracking-[-0.025em] text-ink sm:text-4xl">
							Login Entry
						</h2>
						<p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-label">
							Log_ID: Secure_Entry_V4
						</p>
					</div>
					<WaxSeal />
				</header>

				<form
					id="login-form"
					onSubmit={onSubmit}
					noValidate
					className="flex flex-1 flex-col gap-8"
				>
					<FieldInput
						type="email"
						label="Observer ID / Email"
						placeholder="e.vance@field.net"
						value={email}
						onChange={onEmailChange}
						required
					/>

					<FieldInput
						type="password"
						label="Access Key"
						placeholder="••••••••"
						value={password}
						onChange={onPasswordChange}
						required
						action={
							<button
								type="button"
								className="bg-paper px-1 font-mono text-[11px] uppercase tracking-[0.12em] text-accent-orange underline decoration-dotted underline-offset-4"
							>
								Lost Key?
							</button>
						}
					/>

					{error ? (
						<div
							className="border border-accent-red px-3 py-2 font-mono text-xs uppercase tracking-[0.08em] text-accent-red"
							style={{
								backgroundColor:
									"color-mix(in srgb, var(--color-accent-red) 5%, transparent)",
							}}
						>
							{error}
						</div>
					) : null}

					<div className="mt-auto pt-6">
						<div className="relative mb-6 border-b-2 border-ink pb-8">
							<div className="space-y-2 font-mono text-[10px] uppercase tracking-[0.12em] text-label sm:text-[11px]">
								<div className="flex gap-4">
									<span className="w-12 opacity-60">Date:</span>
									<span className="font-bold text-ink">{dateLabel}</span>
								</div>
								<div className="flex gap-4">
									<span className="w-12 opacity-60">Loc:</span>
									<span className="italic text-ink">Encrypted_Port</span>
								</div>
							</div>

							<StampButton
								type="submit"
								form="login-form"
								disabled={loading}
								className="absolute right-0 bottom-8 sm:right-2 lg:bottom-9"
							>
								{loading ? "..." : "Login"}
							</StampButton>
						</div>

						<div className="space-y-3">
							<div className="flex items-center gap-4">
								<div className="h-px flex-1 bg-label/20" />
								<MonoText className="text-[9px] text-label">
									Alternative Access Protocols
								</MonoText>
								<div className="h-px flex-1 bg-label/20" />
							</div>

							<div className="flex flex-col gap-3 sm:flex-row">
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
							</div>
						</div>
					</div>
				</form>
			</div>
		</section>
	);
}
