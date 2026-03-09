import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "ft_transcendence",
  description: "Frontend du projet ft_transcendence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <Navbar />
        <main className="mx-auto max-w-6xl px-6">{children}</main>
      </body>
    </html>
  );
}