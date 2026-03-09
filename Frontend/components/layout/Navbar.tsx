import Link from "next/link";

export default function Navbar() {
  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-gray-900">
          ft_transcendence
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="rounded px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Home
          </Link>

          <Link
            href="/login"
            className="rounded px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Register
          </Link>

          <Link
            href="/profil"
            className="rounded px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Profil
          </Link>
        </div>
      </nav>
    </header>
  );
}