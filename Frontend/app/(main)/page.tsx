import Link from "next/link";

export default function HomePage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 py-10 text-white">
      <div className="w-full max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md md:p-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-orange-400">
            ft_transcendence
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            A modern social platform with real-time interaction
          </h1>

          <p className="mt-4 text-base leading-7 text-white/65 md:text-lg">
            Connect with friends, manage your profile, follow notifications,
            and build a connected community experience through a clean and modern interface.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold uppercase tracking-[0.15em] text-white transition hover:bg-orange-600"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white/75 transition hover:border-orange-500/50 hover:text-white"
            >
              Create account
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <h2 className="text-lg font-semibold text-white">Profiles</h2>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Personal profile pages with identity, bio, preferences and social presence.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <h2 className="text-lg font-semibold text-white">Friends</h2>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Build your community, manage connections and interact with other users.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <h2 className="text-lg font-semibold text-white">Notifications</h2>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Stay updated with account activity, friend requests and real-time interactions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}