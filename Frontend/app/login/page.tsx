"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "../../lib/api";
import Link from "next/link";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const data = await loginUser({ email, password });

      localStorage.setItem("token", data.token);

      router.push("/profil");
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center text-center">

      <h1 className="mb-6 text-4xl font-bold text-white-900">
        Connexion
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-md flex-col gap-4"
      >
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
          className="rounded-lg bg-red-500 px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
        >
          Se connecter
        </button>
      </form>

      {message && (
        <p className="mt-4 text-red-500">
          {message}
        </p>
      )}

      <p className="mt-6 text-gray-600">
        Pas encore de compte ?{" "}
        <Link
          href="/register"
          className="font-semibold text-red-500 hover:underline"
        >
          Créer un compte
        </Link>
      </p>

    </section>
  );
}