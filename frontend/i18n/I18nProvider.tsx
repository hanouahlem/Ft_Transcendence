"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { defaultLocale, getLocaleDirection, isLocale, localeCookieName, localeStorageKey, type Locale } from "./config";
import { applyTranslationParams, getTranslation, translations } from "./messages";

// Note: `createContext`, `useState`, `useEffect`, etc. viennent de React (fonctions deja existantes).
// [Cree pour ce projet] API i18n exposee au reste de l'app via `useI18n()`.
type I18nContextType = {
    locale: Locale;
    direction: "ltr" | "rtl";
    isRtl: boolean;
    setLocale: (locale: Locale) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// [Cree pour ce projet] Synchronise la locale entre reload, SSR et client.
function persistLocale(locale: Locale) {
    localStorage.setItem(localeStorageKey, locale);
    document.cookie = `${localeCookieName}=${locale}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = locale;
    document.documentElement.dir = getLocaleDirection(locale);
}

// [Cree pour ce projet] Lit la locale depuis localStorage, puis fallback cookie.
function readStoredLocale() {
    const storedLocale = localStorage.getItem(localeStorageKey);
    if (isLocale(storedLocale)) {
        return storedLocale;
    }

    const cookieValue = document.cookie
        .split("; ")
        .find((entry) => entry.startsWith(`${localeCookieName}=`))
        ?.split("=")[1];

    return isLocale(cookieValue) ? cookieValue : null;
}

export function I18nProvider({ children, initialLocale }: { children: ReactNode; initialLocale: Locale; }) {
    // [Cree pour ce projet] `initialLocale` vient du layout serveur, puis peut etre surcharge cote client.
    const [locale, setLocaleState] = useState<Locale>(initialLocale);

    useEffect(() => {
        const storedLocale = readStoredLocale();
        if (storedLocale && storedLocale !== locale) {
            setLocaleState(storedLocale);
        }
    }, []);

    useEffect(() => {
        persistLocale(locale);
    }, [locale]);

    const setLocale = useCallback((nextLocale: Locale) => {
        setLocaleState(nextLocale);
    }, []);

    // [Cree pour ce projet] Fonction principale de traduction:
    // locale courante -> locale par defaut -> cle brute (si manquante).
    const t = useCallback((key: string, params?: Record<string, string | number>) => {
        const current = translations[locale];
        const fallback = translations[defaultLocale];
        const translatedValue = getTranslation(current, key) ?? getTranslation(fallback, key) ?? key;
        return applyTranslationParams(translatedValue, params);
    }, [locale]);

    // [Cree pour ce projet] Context memoise pour limiter les rerenders inutiles.
    const value = useMemo<I18nContextType>(() => ({
        locale,
        direction: getLocaleDirection(locale),
        isRtl: getLocaleDirection(locale) === "rtl",
        setLocale,
        t,
    }), [locale, setLocale, t]);

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
    const context = useContext(I18nContext);

    // [Cree pour ce projet] Garde explicite pour detecter une mauvaise integration du provider.
    if (!context) {
        throw new Error("useI18n must be used inside an I18nProvider");
    }

    return context;
}
