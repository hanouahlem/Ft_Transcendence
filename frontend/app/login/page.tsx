"use client";

import type { ChangeEvent, CSSProperties, FormEvent, ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { loginUser } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const ACCENT_COLORS = ["#3A698A", "#285A35", "#FF4A1C"];

const LOGIN_LAYOUT = {
	stageMaxWidth: "69rem",
	greenPanel: {
		top: "2.5rem",
		right: "1rem",
		bottom: "2.5rem",
		width: "65%",
	},
	paperCard: {
		left: "3rem",
		width: "50%",
		rotate: "-2deg",
	},
	leftBeads: {
		left: "0rem",
		top: "20%",
		shiftX: "50%",
	},
	signupStrip: {
		bottom: "-4rem",
	},
};

const LOGIN_LAYOUT_VARS = {
	"--login-stage-max-width": LOGIN_LAYOUT.stageMaxWidth,
	"--login-green-top": LOGIN_LAYOUT.greenPanel.top,
	"--login-green-right": LOGIN_LAYOUT.greenPanel.right,
	"--login-green-bottom": LOGIN_LAYOUT.greenPanel.bottom,
	"--login-green-width": LOGIN_LAYOUT.greenPanel.width,
	"--login-paper-left": LOGIN_LAYOUT.paperCard.left,
	"--login-paper-width": LOGIN_LAYOUT.paperCard.width,
	"--login-paper-rotate": LOGIN_LAYOUT.paperCard.rotate,
	"--login-beads-left": LOGIN_LAYOUT.leftBeads.left,
	"--login-beads-top": LOGIN_LAYOUT.leftBeads.top,
	"--login-beads-shift-x": LOGIN_LAYOUT.leftBeads.shiftX,
	"--login-signup-bottom": LOGIN_LAYOUT.signupStrip.bottom,
} as CSSProperties;

function MonoText({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<span
			className={cn(
				"font-['Courier_Prime'] text-[10px] uppercase tracking-[0.28em]",
				className,
			)}
		>
			{children}
		</span>
	);
}

function Bead({ color, className }: { color: string; className?: string }) {
	return (
		<div
			className={cn(
				"h-3.5 w-3.5 rounded-full border border-black/20 shadow-[0_2px_4px_rgba(0,0,0,0.35)]",
				className,
			)}
			style={{ backgroundColor: color }}
		/>
	);
}

function SvgDefinitions() {
	return (
		<svg className="absolute h-0 w-0" aria-hidden="true">
			<defs>
				<filter id="torn-paper" x="-10%" y="-10%" width="120%" height="120%">
					<feTurbulence
						type="fractalNoise"
						baseFrequency="0.08"
						numOctaves="3"
						result="noise"
					/>
					<feDisplacementMap
						in="SourceGraphic"
						in2="noise"
						scale="5"
						xChannelSelector="R"
						yChannelSelector="G"
					/>
				</filter>
				<filter id="ink-texture" x="-10%" y="-10%" width="120%" height="120%">
					<feTurbulence
						type="fractalNoise"
						baseFrequency="0.2"
						numOctaves="4"
						result="turbulence"
					/>
					<feDisplacementMap
						in="SourceGraphic"
						in2="turbulence"
						scale="3"
						xChannelSelector="R"
						yChannelSelector="G"
					/>
				</filter>
			</defs>
		</svg>
	);
}

function AccentBeads({
	className,
	vertical = false,
}: {
	className?: string;
	vertical?: boolean;
}) {
	return (
		<div
			className={cn("flex gap-2", vertical && "flex-col", className)}
			aria-hidden="true"
		>
			{ACCENT_COLORS.map((color) => (
				<Bead key={color} color={color} />
			))}
		</div>
	);
}

function ArchivePanel() {
	return (
		<section className="relative overflow-hidden border border-black/20 bg-[#285A35] px-6 py-8 text-[#F5F2EB] shadow-[15px_15px_30px_rgba(0,0,0,0.2)] sm:px-8 sm:py-10 lg:absolute lg:top-[var(--login-green-top)] lg:right-[var(--login-green-right)] lg:bottom-[var(--login-green-bottom)] lg:w-[var(--login-green-width)] lg:px-10 lg:py-10">
			<svg
				className="pointer-events-none absolute -bottom-24 -right-14 h-[26rem] w-[26rem] rotate-12 fill-none stroke-white/10"
				viewBox="0 0 50 50"
				aria-hidden="true"
			>
				<polygon points="25,2 31,18 48,25 31,32 25,48 19,32 2,25 19,18" />
			</svg>

			<div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/20 to-transparent" />
			<div className="absolute inset-y-0 left-3 w-px bg-[repeating-linear-gradient(to_bottom,#FF4A1C_0,#FF4A1C_8px,transparent_8px,transparent_16px)]" />
			<div className="absolute inset-y-0 left-[18px] w-px bg-[repeating-linear-gradient(to_bottom,#FF4A1C_0,#FF4A1C_8px,transparent_8px,transparent_16px)]" />

			<div className="relative z-10 flex h-full flex-col justify-between gap-10">
				<div className="ml-auto flex max-w-md flex-col items-end text-right lg:w-2/3">
					<div className="mb-8 flex w-full flex-row-reverse items-center gap-4">
						<div className="flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-white/35">
							<svg
								className="h-8 w-8 fill-none stroke-white/70"
								viewBox="0 0 50 50"
								aria-hidden="true"
							>
								<polygon points="25,2 31,18 48,25 31,32 25,48 19,32 2,25 19,18" />
							</svg>
						</div>
						<div className="h-px flex-1 bg-white/30" />
					</div>

					<h1 className="font-['Noto_Serif_SC'] text-8xl font-black uppercase leading-[0.85] tracking-[-0.05em] text-[#F5F2EB] mix-blend-overlay">
						Field
						<br />
						Notes
					</h1>

					<div className="mt-8 space-y-2 text-right">
						<MonoText className="block text-xs text-[#F5F2EB]/75">
							Official Repository
						</MonoText>
						<MonoText className="block text-xs text-[#F5F2EB]/75">
							Est. 1892
						</MonoText>
					</div>
				</div>

				<div className="ml-auto max-w-sm border-r-2 border-[#FF4A1C]/50 pr-4 text-right">
					<MonoText className="block text-[10px] leading-5 text-[#F5F2EB]/55 tracking-[0.16em]">
						Property of the global observation network. Unauthorized access is
						strictly recorded. Ensure all entries are permanently affixed.
					</MonoText>
				</div>
			</div>
		</section>
	);
}

function WaxSeal() {
	return (
		<div className="relative -mt-4 mr-2 flex h-12 w-12 rotate-15 items-center justify-center rounded-full bg-[#A52A2A] font-['Noto_Serif_SC'] text-base font-bold shadow-[inset_2px_2px_6px_rgba(0,0,0,0.5),2px_3px_5px_rgba(0,0,0,0.3)] sm:h-14 sm:w-14 sm:text-2xl">
			<span
				className="text-[#A52A2A]/70"
				style={{
					textShadow:
						"-0.75px -0.75px 0 rgba(255,255,255,0.22), 1px 1px 0 rgba(90,20,20,0.42)",
				}}
			>
				42
			</span>
			<div className="absolute inset-0.5 rounded-full border border-white/20" />
		</div>
	);
}

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
						"bg-[#F5F2EB] px-1 font-['Courier_Prime'] text-[11px] uppercase tracking-[0.12em] transition-colors",
						focused ? "text-[#FF4A1C]" : "text-[#5A564C]",
					)}
				>
					{label}
				</label>
				{action}
			</div>

			<div
				className={cn(
					"border bg-white/40 p-2 transition-colors",
					focused ? "border-[#FF4A1C]/50" : "border-[#5A564C]/30",
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
						"w-full border-0 border-b-2 border-dotted border-[#5A564C] bg-transparent px-1 pt-3 pb-1 font-['Courier_Prime'] text-lg text-[#1A1A1A] outline-none transition-colors placeholder:text-[#5A564C]/40 focus:border-[#FF4A1C] focus:bg-[#FF4A1C]/[0.02]",
						type === "password" && "tracking-[0.1em]",
					)}
				/>
			</div>
		</div>
	);
}

function SocialProviderButton({
	label,
	children,
	onClick,
}: {
	label: string;
	children: ReactNode;
	onClick?: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="flex flex-1 items-center justify-center gap-3 border border-[#5A564C]/30 bg-white px-4 py-3 font-['Courier_Prime'] text-[11px] uppercase tracking-[0.12em] text-[#1A1A1A] transition-all hover:border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F5F2EB]"
		>
			{children}
			{label}
		</button>
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
				className="flex items-center justify-center border-4 rounded-xl border-[#D32F2F] bg-transparent px-4 py-2 font-['Noto_Serif_SC'] text-3xl font-black uppercase tracking-[0.2em] text-[#D32F2F]"
				style={{ filter: "url(#ink-texture)", transform: "rotate(-6deg)" }}
			>
				{loading ? "..." : "Login"}
			</span>
		</button>
	);
}

function GoogleIcon() {
	return (
		<svg
			className="h-4 w-4"
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
		>
			<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
			<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
			<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
			<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
		</svg>
	);
}

function GitHubIcon() {
	return (
		<svg
			className="h-4 w-4"
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
		>
			<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
		</svg>
	);
}

function PaperCard({
	email,
	password,
	loading,
	error,
	dateLabel,
	onEmailChange,
	onPasswordChange,
	onSubmit,
	onGitHubLogin,
}: {
	email: string;
	password: string;
	loading: boolean;
	error: string;
	dateLabel: string;
	onEmailChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onPasswordChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	onGitHubLogin: () => void;
}) {
	return (
		<section className="relative z-20 overflow-visible border border-[#E8E1D5] bg-[#F5F2EB] shadow-[0_20px_50px_rgba(0,0,0,0.4)] lg:absolute lg:inset-y-0 lg:left-[var(--login-paper-left)] lg:w-[var(--login-paper-width)] lg:[transform:rotate(var(--login-paper-rotate))]">
			<div
				className="pointer-events-none absolute inset-0 opacity-50"
				style={{
					backgroundImage: "radial-gradient(#E8E1D5 1px, transparent 1px)",
					backgroundSize: "16px 16px",
				}}
			/>

			<div className="absolute -top-3 left-[24%] h-8 w-32 -rotate-3 bg-[#FF4A1C] opacity-85 mix-blend-multiply shadow-[0_1px_3px_rgba(0,0,0,0.2)]" />
			<div className="absolute -bottom-2 right-[24%] h-6 w-24 rotate-2 bg-[#FF4A1C] opacity-85 mix-blend-multiply shadow-[0_1px_3px_rgba(0,0,0,0.2)]" />

			<div className="relative flex h-full flex-col px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
				<header className="mb-10 flex items-start justify-between gap-6">
					<div>
						<div className="mb-3 inline-block bg-[#1A1A1A] px-2 py-1 font-['Courier_Prime'] text-[9px] uppercase tracking-[0.12em] text-[#F5F2EB] sm:text-[10px]">
							Form 4A - Authorized Personnel
						</div>
						<h2 className="font-['Noto_Serif_SC'] text-3xl font-black uppercase tracking-[-0.025em] text-[#1A1A1A] sm:text-4xl">
							Login Entry
						</h2>
						<p className="mt-1 font-['Courier_Prime'] text-[11px] uppercase tracking-[0.12em] text-[#5A564C]">
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
								className="bg-[#F5F2EB] px-1 font-['Courier_Prime'] text-[11px] uppercase tracking-[0.12em] text-[#FF4A1C] underline decoration-dotted underline-offset-4"
							>
								Lost Key?
							</button>
						}
					/>

					{error ? (
						<div className="border border-[#D32F2F] bg-[#D32F2F]/5 px-3 py-2 font-['Courier_Prime'] text-xs uppercase tracking-[0.08em] text-[#D32F2F]">
							{error}
						</div>
					) : null}

					<div className="mt-auto pt-6">
						<div className="relative mb-6 border-b-2 border-[#1A1A1A] pb-8">
							<div className="space-y-2 font-['Courier_Prime'] text-[10px] uppercase tracking-[0.12em] text-[#5A564C] sm:text-[11px]">
								<div className="flex gap-4">
									<span className="w-12 opacity-60">Date:</span>
									<span className="font-bold text-[#1A1A1A]">{dateLabel}</span>
								</div>
								<div className="flex gap-4">
									<span className="w-12 opacity-60">Loc:</span>
									<span className="italic text-[#1A1A1A]">Encrypted_Port</span>
								</div>
							</div>

							<StampSubmitButton loading={loading} />
						</div>

						<div className="space-y-3">
							<div className="flex items-center gap-4">
								<div className="h-px flex-1 bg-[#5A564C]/20" />
								<MonoText className="text-[9px] text-[#5A564C]">
									Alternative Access Protocols
								</MonoText>
								<div className="h-px flex-1 bg-[#5A564C]/20" />
							</div>

							<div className="flex flex-col gap-3 sm:flex-row">
								<SocialProviderButton label="Google">
									<GoogleIcon />
								</SocialProviderButton>
								<SocialProviderButton label="GitHub" onClick={onGitHubLogin}>
									<GitHubIcon />
								</SocialProviderButton>
							</div>
						</div>
					</div>
				</form>
			</div>
		</section>
	);
}

export default function LoginPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { login, isLoggedIn, isAuthLoading } = useAuth();

	const [identifier, setIdentifier] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!isAuthLoading && isLoggedIn) {
			router.replace("/feed");
		}
	}, [isAuthLoading, isLoggedIn, router]);

	useEffect(() => {
		const oauthError = searchParams.get("error");

		if (oauthError) {
			setError(oauthError);
		}
	}, [searchParams]);

	useEffect(() => {
		const style = document.createElement("style");
		style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Noto+Serif+SC:wght@400;700;900&display=swap');
      ::selection { background-color: #FF4A1C; color: #F5F2EB; }
    `;
		document.head.appendChild(style);

		return () => {
			document.head.removeChild(style);
		};
	}, []);

	if (isAuthLoading || isLoggedIn) {
		return null;
	}

	const dateLabel = new Date()
		.toLocaleDateString("en-US", {
			month: "short",
			day: "2-digit",
			year: "numeric",
		})
		.toUpperCase();

	const handleGitHubLogin = () => {
		window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/github`;
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setLoading(true);
		setError("");

		try {
			const result = await loginUser({ identifier, password });

			if (!result.ok) {
				setError(result.message);
				return;
			}

			if (result.data.token) {
				const loginSucceeded = await login(result.data.token);

				if (!loginSucceeded) {
					setError("Login failed while loading your account.");
					return;
				}

				router.push("/feed");
				return;
			}

			setError("Token not received.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div
			className="relative min-h-screen overflow-hidden bg-[#D4C9B3] antialiased"
			style={{
				backgroundImage:
					"linear-gradient(rgba(26,26,26,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(26,26,26,0.05) 1px, transparent 1px)",
				backgroundSize: "40px 40px",
			}}
		>
			<SvgDefinitions />

			<div
				className="relative z-10 mx-auto flex min-h-screen w-full max-w-[var(--login-stage-max-width)] items-center justify-center px-4 py-10 sm:px-6 lg:px-8"
				style={LOGIN_LAYOUT_VARS}
			>
				<div className="relative flex w-full flex-col gap-6 lg:h-[700px] lg:justify-center">
					<ArchivePanel />

					<PaperCard
						email={identifier}
						password={password}
						loading={loading}
						error={error}
						dateLabel={dateLabel}
						onEmailChange={(event) => setIdentifier(event.target.value)}
						onPasswordChange={(event) => setPassword(event.target.value)}
						onSubmit={handleSubmit}
						onGitHubLogin={handleGitHubLogin}
					/>

					<AccentBeads
						className="absolute z-30 hidden lg:flex lg:left-[var(--login-beads-left)] lg:top-[var(--login-beads-top)] lg:translate-x-[var(--login-beads-shift-x)]"
						vertical
					/>

					<div className="text-center lg:absolute lg:bottom-[var(--login-signup-bottom)] lg:left-0 lg:right-0">
						<p className="inline-block border border-[#5A564C]/20 bg-[#E8E1D5] px-4 py-2 font-['Courier_Prime'] text-[11px] uppercase tracking-[0.3em] text-[#1A1A1A]/65">
							Not a member?
							<Link
								href="/register"
								className="ml-2 font-bold text-[#FF4A1C] underline decoration-dotted underline-offset-4"
							>
								Apply for credentials
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
