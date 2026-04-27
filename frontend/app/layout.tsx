import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import { AuthProvider } from "@/context/AuthContext";
import { AppToaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { I18nProvider } from "@/i18n/I18nProvider";
import { defaultLocale, getLocaleDirection, isLocale, localeCookieName } from "@/i18n/config";

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
  preload: false,
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
  preload: false,
});

export const metadata: Metadata = {
  title: "ft_transcendence",
  description: "Frontend du projet ft_transcendence",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(localeCookieName)?.value;
  const initialLocale = isLocale(cookieValue) ? cookieValue : defaultLocale;
  const direction = getLocaleDirection(initialLocale);

  return (
    <html lang={initialLocale} dir={direction} className={cn(displaySerif.variable, monoFont.variable)}>
      <body className="min-h-screen bg-neutral-950 text-white">
        <I18nProvider initialLocale={initialLocale}>
          <AuthProvider>
            {children}
            <AppToaster />
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
