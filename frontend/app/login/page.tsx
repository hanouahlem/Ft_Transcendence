"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { loginUser } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

/* ── Courier Text ── */
function CourierText({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "text-[10px] uppercase tracking-wider text-[#5A564C]",
        className,
      )}
      style={{ fontFamily: "'Courier Prime', monospace" }}
    >
      {children}
    </span>
  );
}

/* ── Bead ── */
function Bead({ color, size = "sm" }: { color: string; size?: "sm" | "md" }) {
  const s = size === "sm" ? "h-2 w-2" : "h-3 w-3 shadow-md";
  return <div className={`${s} rounded-full`} style={{ background: color }} />;
}

const BEAD_COLORS = ["#3A698A", "#285A35", "#FF4A1C"];

/* ── Ledger Input ── */
function LedgerInput({
  type,
  placeholder,
  value,
  onChange,
  required,
}: {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full bg-transparent border-0 border-b border-dashed border-[#5A564C] px-1 py-2 text-lg text-[#1A1A1A] outline-none placeholder:text-[#5A564C]/40 focus:border-solid focus:border-[#FF4A1C]"
      style={{ fontFamily: "'Courier Prime', monospace" }}
    />
  );
}

/* ── Social Button ── */
function SocialButton({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      className="flex flex-1 items-center justify-center gap-2 border border-[#5A564C]/30 bg-[#F5F2EB] px-4 py-2 text-xs uppercase tracking-wider text-[#1A1A1A] transition-all hover:border-[#FF4A1C] hover:text-[#FF4A1C] cursor-pointer"
      style={{ fontFamily: "'Courier Prime', monospace" }}
    >
      {icon}
      {label}
    </button>
  );
}

/* ── Stamp Button ── */
function StampButton({
  loading,
  onClick,
}: {
  loading: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="relative bg-transparent border-0 p-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 isolate overflow-visible"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="border-[3px] border-red-600 bg-transparent px-6 py-3 text-xl font-bold uppercase tracking-[0.2em] text-red-600"
        style={{
          transform: hovered ? "rotate(-1deg)" : "rotate(1deg)",
          filter: "url(#ink-texture)",
          fontFamily: "'Noto Serif SC', serif",
        }}
      >
        {loading ? "..." : "LOGIN"}
      </div>
      <div className="absolute -inset-1 border border-red-600 opacity-20 pointer-events-none -rotate-2" />
    </button>
  );
}

/* ── Book Spine (Left Panel) ── */
function BookSpine() {
  return (
    <div
      className="relative flex w-1/2 h-full flex-col items-center justify-center overflow-hidden border-r border-black/20 p-12 text-[#F5F2EB]"
      style={{ backgroundColor: "#285A35" }}
    >
      {/* Spine gradient overlay */}
      <div
        className="absolute left-0 top-0 bottom-0 w-10 z-10"
        style={{
          background: "linear-gradient(to right, rgba(0,0,0,0.2), transparent)",
        }}
      />
      {/* Stitch lines */}
      <div
        className="absolute left-3 top-0 bottom-0 w-px"
        style={{
          background:
            "repeating-linear-gradient(to bottom, #FF4A1C 0, #FF4A1C 8px, transparent 8px, transparent 16px)",
        }}
      />
      <div
        className="absolute left-[18px] top-0 bottom-0 w-px"
        style={{
          background:
            "repeating-linear-gradient(to bottom, #FF4A1C 0, #FF4A1C 8px, transparent 8px, transparent 16px)",
        }}
      />

      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/30">
          <svg className="h-10 w-10 stroke-white/50 fill-none">
            <use href="#star-icon" />
          </svg>
        </div>
        <h1 className="text-4xl font-black uppercase -tracking-wider leading-none mix-blend-overlay mb-4">
          Field
          <br />
          Notes
        </h1>
        <CourierText className="block pt-4 text-[#F5F2EB] tracking-[0.3em] opacity-60">
          OFFICIAL REPOSITORY
          <br />
          EST. 1892
        </CourierText>
      </div>

      <CourierText className="absolute bottom-8 left-12 right-8 block text-[9px] text-[#F5F2EB] leading-relaxed opacity-40">
        Property of the global observation network. Unauthorized access is
        strictly recorded.
      </CourierText>
    </div>
  );
}

/* ── SVG Filters ── */
function SvgFilters() {
  return (
    <svg className="absolute w-0 h-0" aria-hidden="true">
      <filter id="torn-paper" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.04"
          numOctaves="4"
          result="noise"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="noise"
          scale="4"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
      <filter id="ink-texture" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.15"
          numOctaves="3"
          result="turbulence"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="turbulence"
          scale="2"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
      <symbol id="star-icon" viewBox="0 0 50 50">
        <polygon points="25,5 30,20 45,25 30,30 25,45 20,30 5,25 20,20" />
      </symbol>
    </svg>
  );
}

/* ── Main Login Page ── */
export default function LoginPage() {
  const router = useRouter();
  const { login, isLoggedIn, isAuthLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthLoading && isLoggedIn) {
      router.replace("/feed");
    }
  }, [isLoggedIn, isAuthLoading, router]);

  /* inject fonts */
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Noto+Serif+SC:wght@400;700;900&display=swap');
      .selection-orange ::selection { background: #FF4A1C; color: #F5F2EB; }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (isAuthLoading || isLoggedIn) return null;

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await loginUser({ email, password });

      if (!result.ok) {
        setError(result.message);
        return;
      }

      if (result.data.token) {
        await login(result.data.token);
        router.push("/feed");
      } else {
        setError("Token not received.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex h-screen w-full items-center justify-center relative overflow-hidden antialiased"
      style={{
        backgroundColor: "#F5F2EB",
        backgroundImage: "radial-gradient(#E8E1D5 1px, transparent 1px)",
        backgroundSize: "32px 32px",
        fontFamily: "'Noto Serif SC', 'Songti SC', STSong, serif",
      }}
    >
      <SvgFilters />

      <div className="relative z-10 flex h-full w-full max-w-[900px] items-center justify-center px-8">
        <div className="relative flex w-full max-w-[800px] h-[560px] shadow-2xl -rotate-1">
          <BookSpine />

          {/* Right Panel — Login Form */}
          <div className="relative flex w-1/2 h-full flex-col justify-between overflow-hidden p-12 bg-[#E8E1D5]">
            {/* Decorative circle */}
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full border-4 border-dashed border-[#5A564C] bg-[#D4C9B3] opacity-20" />

            {/* Header */}
            <div className="border-b border-[#5A564C]/30 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold uppercase -tracking-wider mix-blend-multiply m-0">
                    Member Login
                  </h2>
                  <CourierText className="mt-1 block text-xl">
                    Please log in.
                  </CourierText>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#a52a2a] font-bold text-white/40 -rotate-15 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.4),1px_1px_3px_rgba(0,0,0,0.2)]">
                  42
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-8 py-6">
              <div className="flex flex-col gap-1">
                <CourierText>Username / Email</CourierText>
                <LedgerInput
                  type="email"
                  placeholder="xavier"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <CourierText>Password</CourierText>
                  <a
                    href="#"
                    className="text-[10px] text-[#FF4A1C] no-underline"
                    style={{ fontFamily: "'Courier Prime', monospace" }}
                  >
                    LOST KEY?
                  </a>
                </div>
                <LedgerInput
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <CourierText className="block border border-red-600 bg-red-600/5 px-3 py-2 text-xs text-red-600">
                  {error}
                </CourierText>
              )}
            </form>

            {/* Social Login */}
            <div className="mt-4">
              <div className="mb-3 text-center">
                <CourierText>Or continue with</CourierText>
              </div>
              <div className="flex gap-3">
                <SocialButton
                  label="Google"
                  icon={
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  }
                />
                <SocialButton
                  label="GitHub"
                  icon={
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  }
                />
              </div>
            </div>

            {/* Footer */}
            <div className="mt-auto flex items-center justify-between pt-8">
              <CourierText className="block text-[9px] leading-snug">
                DATE: <span className="font-bold">MAY 14, 2024</span>
                <br />
                LOC: <span className="italic">ENCRYPTED_PORT</span>
              </CourierText>

              <StampButton loading={loading} onClick={() => handleSubmit()} />
            </div>

            {/* Side beads */}
            <div className="absolute top-1/2 right-4 flex -translate-y-1/2 flex-col gap-1">
              {BEAD_COLORS.map((c) => (
                <Bead key={c} color={c} />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom link */}
        <div className="absolute bottom-12 text-center">
          <CourierText className="text-xs tracking-[0.3em] opacity-60">
            Not a member?{" "}
            <Link
              href="/register"
              className="font-bold text-[#1A1A1A] no-underline transition-colors hover:text-[#FF4A1C]"
            >
              Apply for credentials
            </Link>
          </CourierText>
        </div>
      </div>

      {/* Corner beads */}
      <div className="fixed bottom-8 right-8 z-20 flex rotate-45 gap-2">
        {BEAD_COLORS.map((c) => (
          <Bead key={c} color={c} size="md" />
        ))}
      </div>
    </div>
  );
}
