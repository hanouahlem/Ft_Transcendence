import {
	useState,
	type ChangeEvent,
	type FormEvent,
	type ReactNode,
} from "react";
import OAuthProviderButton from "@/components/auth/OAuthProviderButton";
import { FortyTwoIcon, GithubIcon } from "@/components/auth/OAuthIcons";
import { cn } from "@/lib/utils";
import { MonoText, WaxSeal } from "./LoginDecor";

function FieldInput({
	type,
	label,
	placeholder,
	value,
	onChange,
	required,
	action,
}: {
	type: "email" | "password";
	label: string;
	placeholder: string;
	value: string;
	onChange: (event: ChangeEvent<HTMLInputElement>) => void;
	required?: boolean;
	action?: ReactNode;
}) {
	const [focused, setFocused] = useState(false);

	return (
		<div className="relative">
			<div className="absolute -top-3 left-1 right-1 z-10 flex items-center justify-between">
				<label
					className={cn(
						"bg-field-paper px-1 font-field-mono text-[11px] uppercase tracking-[0.12em] transition-colors",
						focused ? "text-field-accent" : "text-field-label",
					)}
				>
					{label}
				</label>
				{action}
			</div>

			<div
				className={cn(
					"border bg-white/40 p-2 transition-colors",
					focused ? "border-field-accent/50" : "border-field-label/30",
				)}
			>
				<input
					type={type}
					placeholder={placeholder}
					value={value}
					onChange={onChange}
					onFocus={() => setFocused(true)}
					onBlur={() => setFocused(false)}
					required={required}
					className={cn(
						"w-full border-0 border-b-2 border-dotted border-field-label bg-transparent px-1 pt-3 pb-1 font-field-mono text-lg text-field-ink outline-none transition-colors placeholder:text-field-label/40 focus:border-field-accent focus:bg-field-accent/[0.02]",
						type === "password" && "tracking-[0.1em]",
					)}
				/>
			</div>
		</div>
	);
}

function StampSubmitButton({ loading }: { loading: boolean }) {
	return (
		<button
			type="submit"
			form="login-form"
			disabled={loading}
			className="absolute right-0 bottom-8 origin-center cursor-pointer transition-transform duration-200 hover:scale-105 hover:-rotate-2 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:right-2 lg:bottom-9"
		>
			<span
				className="flex items-center justify-center rounded-xl border-4 border-field-stamp bg-transparent px-4 py-2 font-field-display text-3xl font-black uppercase tracking-[0.2em] text-field-stamp"
				style={{ filter: "url(#ink-texture)", transform: "rotate(-6deg)" }}
			>
				{loading ? "..." : "Login"}
			</span>
		</button>
	);
}

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
		<section className="relative z-20 overflow-visible border border-field-paper-muted bg-field-paper shadow-[0_20px_50px_rgba(0,0,0,0.4)] lg:absolute lg:inset-y-0 lg:left-[var(--login-paper-left)] lg:w-[var(--login-paper-width)] lg:[transform:rotate(var(--login-paper-rotate))]">
			<div
				className="pointer-events-none absolute inset-0 opacity-50"
				style={{
					backgroundImage:
						"radial-gradient(var(--color-field-paper-muted) 1px, transparent 1px)",
					backgroundSize: "16px 16px",
				}}
			/>

			<div className="absolute -top-3 left-[24%] h-8 w-32 -rotate-3 bg-field-accent opacity-85 mix-blend-multiply shadow-[0_1px_3px_rgba(0,0,0,0.2)]" />
			<div className="absolute -bottom-2 right-[24%] h-6 w-24 rotate-2 bg-field-accent opacity-85 mix-blend-multiply shadow-[0_1px_3px_rgba(0,0,0,0.2)]" />

			<div className="relative flex h-full flex-col px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
				<header className="mb-10 flex items-start justify-between gap-6">
					<div>
						<div className="mb-3 inline-block bg-field-ink px-2 py-1 font-field-mono text-[9px] uppercase tracking-[0.12em] text-field-paper sm:text-[10px]">
							Form 4A - Authorized Personnel
						</div>
						<h2 className="font-field-display text-3xl font-black uppercase tracking-[-0.025em] text-field-ink sm:text-4xl">
							Login Entry
						</h2>
						<p className="mt-1 font-field-mono text-[11px] uppercase tracking-[0.12em] text-field-label">
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
								className="bg-field-paper px-1 font-field-mono text-[11px] uppercase tracking-[0.12em] text-field-accent underline decoration-dotted underline-offset-4"
							>
								Lost Key?
							</button>
						}
					/>

					{error ? (
						<div className="border border-field-stamp bg-field-stamp/5 px-3 py-2 font-field-mono text-xs uppercase tracking-[0.08em] text-field-stamp">
							{error}
						</div>
					) : null}

					<div className="mt-auto pt-6">
						<div className="relative mb-6 border-b-2 border-field-ink pb-8">
							<div className="space-y-2 font-field-mono text-[10px] uppercase tracking-[0.12em] text-field-label sm:text-[11px]">
								<div className="flex gap-4">
									<span className="w-12 opacity-60">Date:</span>
									<span className="font-bold text-field-ink">{dateLabel}</span>
								</div>
								<div className="flex gap-4">
									<span className="w-12 opacity-60">Loc:</span>
									<span className="italic text-field-ink">Encrypted_Port</span>
								</div>
							</div>

							<StampSubmitButton loading={loading} />
						</div>

						<div className="space-y-3">
							<div className="flex items-center gap-4">
								<div className="h-px flex-1 bg-field-label/20" />
								<MonoText className="text-[9px] text-field-label">
									Alternative Access Protocols
								</MonoText>
								<div className="h-px flex-1 bg-field-label/20" />
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
