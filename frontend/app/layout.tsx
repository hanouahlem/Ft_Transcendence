import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { AuthProvider } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const displaySerif = localFont({
  src: [
    {
      path: "../public/fonts/source-serif-pro/webfonts/source-serif-pro-latin-400-normal.woff2",
      style: "normal",
      weight: "400",
    },
    {
      path: "../public/fonts/source-serif-pro/webfonts/source-serif-pro-latin-400-italic.woff2",
      style: "italic",
      weight: "400",
    },
    {
      path: "../public/fonts/source-serif-pro/webfonts/source-serif-pro-latin-600-normal.woff2",
      style: "normal",
      weight: "600 900",
    },
    {
      path: "../public/fonts/source-serif-pro/webfonts/source-serif-pro-latin-600-italic.woff2",
      style: "italic",
      weight: "600 900",
    },
  ],
  variable: "--font-display-source",
});
const monoFont = localFont({
  src: [
    {
      path: "../public/fonts/courier-prime/Courier Prime.ttf",
      style: "normal",
      weight: "400",
    },
    {
      path: "../public/fonts/courier-prime/Courier Prime Italic.ttf",
      style: "italic",
      weight: "400",
    },
    {
      path: "../public/fonts/courier-prime/Courier Prime Bold.ttf",
      style: "normal",
      weight: "700",
    },
    {
      path: "../public/fonts/courier-prime/Courier Prime Bold Italic.ttf",
      style: "italic",
      weight: "700",
    },
  ],
  variable: "--font-mono-source",
});

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
    <html lang="fr" className={cn(displaySerif.variable, monoFont.variable)}>
      <body className="min-h-screen bg-neutral-950 text-white">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
