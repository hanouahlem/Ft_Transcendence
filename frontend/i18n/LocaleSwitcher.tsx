"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { locales, type Locale } from "./config";
import { useI18n } from "./I18nProvider";

// [Cree pour ce projet] Labels courts affiches sur les boutons du switcher.
const LABELS: Record<Locale, string> = { en: "EN", fr: "FR", es: "ES", ar: "AR" };

type LocaleSwitcherProps = {
    className?: string;
    compact?: boolean;
};

export function LocaleSwitcher({ className, compact = false }: LocaleSwitcherProps) {
    const { locale, setLocale, t } = useI18n();

    return (
        // [Cree pour ce projet] Le conteneur expose un label accessible localise.
        <div className={cn("inline-flex items-center gap-1 rounded-full border border-black/10 bg-paper/90 p-1 shadow-sm backdrop-blur", className)} aria-label={t("locale.label")}>
            {locales.map((candidate) => (
                <Button
                    key={candidate}
                    type="button"
                    variant={candidate === locale ? "black" : "ghost"}
                    size={compact ? "xs" : "sm"}
                    className={cn("min-w-10 rounded-full px-3 font-sans text-[10px] tracking-[0.2em]", candidate === locale && "shadow-none")}
                    // [Cree pour ce projet] Au clic: mise a jour du provider + persistance + html lang/dir.
                    onClick={() => setLocale(candidate)}
                    aria-pressed={candidate === locale}
                >
                    {LABELS[candidate]}
                </Button>
            ))}
        </div>
    );
}
