import type { ReactNode } from "react";
import MonoText from "@/components/typography/MonoText";

type AuthProvidersRowProps = {
  label?: string;
  children: ReactNode;
};

export default function AuthProvidersRow({
  label = "Alternative Access Protocols",
  children,
}: AuthProvidersRowProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-label/20" />
        <MonoText className="text-[9px] text-label">{label}</MonoText>
        <div className="h-px flex-1 bg-label/20" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">{children}</div>
    </div>
  );
}
