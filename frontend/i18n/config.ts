// Liste de toutes les langues/locales supportées dans l'application.
// - "en" = Anglais
// - "fr" = Français
// - "es" = Espagnol
// - "ar" = Arabe (droite à gauche)
// Le `as const` dit à TypeScript d'être strict : seules ces 4 valeurs sont acceptées.
export const locales = ["en", "fr", "es", "ar"] as const;

// Type TypeScript qui reprend automatiquement la liste des locales.
// Si on modifie la liste, le type est mis à jour automatiquement.
export type Locale = (typeof locales)[number];

// La langue par défaut si l'utilisateur n'a pas choisi de préférence.
// Utilisé comme fallback quand une traduction manque dans la langue actuelle.
export const defaultLocale: Locale = "en";

// Clés pour persister le choix de langue de l'utilisateur :
// - localStorage : stockage permanent côté client
// - cookies : permet aussi au serveur de connaître la langue
export const localeStorageKey = "ft_locale";
export const localeCookieName = "ft_locale";

// Les locales qui écrivent de droite à gauche (RTL).
// Pour l'arabe, l'UI bascule entièrement en RTL (direction, alignement, etc.)
export const rtlLocales = new Set<Locale>(["ar"]);

/**
 * Valide qu'une valeur est bien une locale acceptée (TypeScript + runtime).
 * Exemple : isLocale("fr") → true, isLocale("de") → false
 * Utile après JSON.parse() ou localStorage.getItem() où on ne peut pas faire confiance au type.
 */
export function isLocale(value: string | null | undefined): value is Locale {
    return typeof value === "string" && (locales as readonly string[]).includes(value);
}

/**
 * Retourne la direction du texte pour une locale donnée.
 * - Arabe ("ar") → "rtl" (droite à gauche)
 * - Autres langues ("en", "fr", "es") → "ltr" (gauche à droite)
 * 
 * Utilisé pour appliquer la classe CSS et l'attribut `dir=` sur le <html>.
 */
export function getLocaleDirection(locale: Locale) {
    return rtlLocales.has(locale) ? "rtl" : "ltr";
}
