"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { locales, type Locale } from "./config";
import { useI18n } from "./I18nProvider";

/*
 * Affiche une rangee de boutons pour changer la langue.
 * Exemple visuel : [ EN ] [ FR ] [ ES ] [ AR ]
 * Celui qui est actif a un style different (fond noir + bordure).
 */

// Labels courts affiches sur les boutons
const LABELS: Record<Locale, string> = { en: "EN", fr: "FR", es: "ES", ar: "AR" };

type LocaleSwitcherProps = {
    /** CSS additionnelle optionnelle (ex: "ml-4" pour une marge à gauche). */
    className?: string;
    
    /** Si true, les boutons sont plus petits. */
    compact?: boolean;
};

export function LocaleSwitcher({ className, compact = false }: LocaleSwitcherProps) {
    // Recupere l'API i18n : locale actuelle et fonction pour la changer
    const { locale, setLocale, t } = useI18n();

    return (
        // Conteneur principal : boite avec bordure, fond legerement transparent (paper/90), coins arrondis
        <div 
            className={cn(
                "inline-flex items-center gap-1 rounded-full border border-black/10 bg-paper/90 p-1 shadow-sm backdrop-blur",
                className
            )}
            // Label accessible (important pour les lecteurs d'ecran)
            // Récupère la traduction : "locale.label" dans messages.ts
            aria-label={t("locale.label")}
        >
            {/* Crée un bouton pour chaque langue supportée */}
            {locales.map((candidate) => (
                <Button
                    key={candidate}
                    type="button"
                    variant={candidate === locale ? "black" : "ghost"}
                    size={compact ? "xs" : "sm"}
                    className={cn(
                        "min-w-10 rounded-full px-3 font-sans text-[10px] tracking-[0.2em]",
                        candidate === locale && "shadow-none"
                    )}
                    // Au clic : appelle setLocale qui change la langue dans le provider
                    // Cela declenche automatiquement :
                    //   1. La persistance en localStorage/cookies
                    //   2. Un rerender de toute l'app (tous les `t()` changent)
                    //   3. La mise a jour de `lang` et `dir` sur le <html>
                    onClick={() => setLocale(candidate)}
                    // Attribut accessible : communique au navigateur que ce bouton est actif
                    aria-pressed={candidate === locale}
                >
                    {/* Affiche le label court : "EN", "FR", etc. */}
                    {LABELS[candidate]}
                </Button>
            ))}
        </div>
    );
}
