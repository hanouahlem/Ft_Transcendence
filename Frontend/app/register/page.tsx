"use client";

import Link from "next/link";
import { useState } from "react";
import { registerUser } from "../../lib/api";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    try {
      await registerUser({ username, email, password });

      setSuccess(true);
      setUsername("");
      setEmail("");
      setPassword("");
    } catch (error: any) {
      setError(error.message || "Une erreur est survenue lors de l’inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="mb-6 text-4xl font-bold text-white-900">
        Créer un compte
      </h1>

      <p className="mb-8 max-w-2xl text-lg text-white-600">
        Rejoins ft_transcendence et crée ton profil pour commencer.
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-md flex-col gap-4"
      >
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-red-500 focus:outline-none"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-red-500 focus:outline-none"
          required
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-red-500 focus:outline-none"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-red-500 px-5 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Création..." : "Créer un compte"}
        </button>
      </form>

      {success && (
        <p className="mt-4 text-green-600">
          Compte créé avec succès !
        </p>
      )}

      {error && (
        <p className="mt-4 text-red-500">
          {error}
        </p>
      )}

      <p className="mt-6 text-gray-600">
        Déjà un compte ?{" "}
        <Link
          href="/login"
          className="font-semibold text-red-500 hover:underline"
        >
          Se connecter
        </Link>
      </p>
    </section>
  );
}