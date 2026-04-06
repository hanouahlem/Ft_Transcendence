import type { ReactNode } from "react";
import localFont from "next/font/local";
import { cn } from "@/lib/utils";
import AppSidebarShell from "@/components/layout/AppSidebarShell";

const appSans = localFont({
  src: [
    {
      path: "../../public/fonts/inter/Inter-VariableFont_opsz,wght.ttf",
      style: "normal",
      weight: "100 900",
    },
  ],
  variable: "--font-sans-source",
  preload: false,
});

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className={cn(appSans.variable, "font-sans")}>
      <AppSidebarShell>{children}</AppSidebarShell>
    </div>
  );
}
