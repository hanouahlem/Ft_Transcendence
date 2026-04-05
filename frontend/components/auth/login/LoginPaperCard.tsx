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
          <AuthFormMeta
            dateLabel={dateLabel}
            locationLabel="Encrypted_Port"
            action={
              <StampButton
                type="submit"
                form="login-form"
                disabled={loading}
                className="absolute right-0 bottom-8 sm:right-2 lg:bottom-9"
              >
                {loading ? "..." : "Login"}
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
