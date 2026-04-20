// [Cree pour ce projet] Locales supportees dans l'application.
// `as const` permet a TypeScript de generer une union stricte a partir de la liste.
export const locales = ["en", "fr", "es", "ar"] as const;

export type Locale = (typeof locales)[number];

// [Cree pour ce projet] Locale par defaut si aucune preference n'est trouvee.
export const defaultLocale: Locale = "en";

// [Cree pour ce projet] Cles de persistance utilisees par le provider.
export const localeStorageKey = "ft_locale";
export const localeCookieName = "ft_locale";

// [Cree pour ce projet] Locales qui basculent toute l'UI en RTL.
export const rtlLocales = new Set<Locale>(["ar"]);

// [Cree pour ce projet] Garde de type runtime pour valider une locale dynamique.
export function isLocale(value: string | null | undefined): value is Locale {
    return typeof value === "string" && (locales as readonly string[]).includes(value);
}

// [Cree pour ce projet] Source unique de verite pour la direction du texte.
export function getLocaleDirection(locale: Locale) {
    return rtlLocales.has(locale) ? "rtl" : "ltr";
}
