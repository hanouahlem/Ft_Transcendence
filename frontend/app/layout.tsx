import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { Courier_Prime, Geist, Noto_Serif_SC } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const loginDisplay = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-field-display-source",
});
const loginMono = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-field-mono-source",
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
    <html
      lang="fr"
      className={cn(
        "font-sans",
        geist.variable,
        loginDisplay.variable,
        loginMono.variable,
      )}
    >
      <body className="min-h-screen bg-neutral-950 text-white">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
