import Link from "next/link";

export default function HomePage() {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <h1 className="mb-4 text-4xl font-bold text-white-900">
        Bienvenue sur ft_transcendence
      </h1>

      <p className="mb-8 max-w-2xl text-lg text-white-600">
        Une plateforme web avec authentification, profils, système d’amis,
        notifications et fonctionnalités temps réel.
      </p>

      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-lg bg-red-500 px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
        >
          Se connecter
        </Link>

        <Link
          href="/register"
          className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100"
        >
          Créer un compte
        </Link>
      </div>
    </section>
  );
}