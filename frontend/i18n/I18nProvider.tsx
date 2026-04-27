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


/** Type de l'API i18n exposee a toute l'application via le contexte React. */
type I18nContextType = {
    /** La locale actuellement active pour l'utilisateur. */
    locale: Locale;
    
    /** Direction du texte : "ltr" (gauche-droite) ou "rtl" (droite-gauche). */
    direction: "ltr" | "rtl";
    
    /** Booleen utile pour les conditions : true si RTL. */
    isRtl: boolean;
    
    /**
     * Change la langue actuelle.
     * Declenche les effets pour persister en localStorage et cookies.
     * Tous les `useI18n()` dans l'arbre se rerendent automatiquement.
     */
    setLocale: (locale: Locale) => void;
    
    /**
     * Fonction principale de traduction.
     * Exemples :
     *   - t("auth.login.submit") → "Login"
     *   - t("feed.posts") → "posts" (en anglais) ou "posts" (en français)
     *   - t("search.resultsCount", { count: 5 }) → "5 posts results"
     * 
     * Parametres optionnels sont remplaces par {placeholder} dans la chaîne.
     */
    t: (key: string, params?: Record<string, string | number>) => string;
};

// Le contexte React qui sera accessible partout via `useI18n()`.
const I18nContext = createContext<I18nContextType | undefined>(undefined);

/**
 * Persiste le choix de langue de l'utilisateur et configure l'apparence.
 * 
 * Actions :
 *   1. Sauvegarde dans localStorage (pour que le choix persiste entre rechargements)
 *   2. Sauvegarde dans les cookies (pour que le serveur connaisse la langue)
 *   3. Configure l'attribut `lang` du <html> (important pour les lecteurs d'ecran)
 *   4. Configure l'attribut `dir` du <html> (gere le RTL pour l'arabe)
 */
function persistLocale(locale: Locale) {
    // Stocke la locale dans localStorage pour le prochain rechargement
    localStorage.setItem(localeStorageKey, locale);
    
    // Stocke aussi dans un cookie avec une date d'expiration d'un an
    // (« max-age=31536000 »)
    document.cookie = `${localeCookieName}=${locale}; path=/; max-age=31536000; samesite=lax`;
    
    // Signal au navigateur et aux outils d'accessibilite quelle langue le document utilise
    document.documentElement.lang = locale;
    
    // Signal au navigateur de basculer en RTL si necessaire (important pour l'arabe)
    document.documentElement.dir = getLocaleDirection(locale);
}

/**
 * Lit la locale sauvegardee depuis localStorage ou les cookies.
 * 
 * Priorite :
 *   1. localStorage (choix le plus recent de l'utilisateur)
 *   2. Cookies (si localStorage a ete vide mais cookie toujours present)
 *   3. null (premiere visite, on utilisera la locale initiale du serveur)
 */
function readStoredLocale() {
    // Essaie de lire depuis localStorage
    const storedLocale = localStorage.getItem(localeStorageKey);
    if (isLocale(storedLocale)) {
        return storedLocale;
    }

    // Fallback : lit depuis les cookies
    const cookieValue = document.cookie
        .split("; ")
        .find((entry) => entry.startsWith(`${localeCookieName}=`))
        ?.split("=")[1];

    // Valide que c'est une locale acceptee, sinon retourne null
    return isLocale(cookieValue) ? cookieValue : null;
}

/**
 * LE PROVIDER i18n - Enveloppe toute l'application pour que les traductions soient accessibles.
 * 
 * Utilisation dans layout.tsx :
 *   <I18nProvider initialLocale="en">
 *     {children}
 *   </I18nProvider>
 * 
 * Ensuite, n'importe quel composant peut faire :
 *   const { t, locale, setLocale } = useI18n();
 */
export function I18nProvider({ children, initialLocale }: { children: ReactNode; initialLocale: Locale; }) {
    const [locale, setLocaleState] = useState<Locale>(initialLocale);

    /**
     * Au montage du composant cote client :
     *   - Essaie de lire la preference sauvegardee (localStorage/cookies)
     *   - Si trouvée et différente de la locale du serveur, la charge
     *   
     * Exemple : serveur dit "en" mais localStorage a "fr" → bascule vers "fr"
     */
    useEffect(() => {
        const storedLocale = readStoredLocale();
        if (storedLocale && storedLocale !== locale) {
            setLocaleState(storedLocale);
        }
    }, []);

    /**
     * À chaque fois que "locale" change :
     *   - Persiste dans localStorage et cookies
     *   - Met a jour l'attribut "lang" et "dir" du <html>
     *   - Declenche un rerender de tous les useI18n()
     */
    useEffect(() => {
        persistLocale(locale);
    }, [locale]);

    const setLocale = useCallback((nextLocale: Locale) => {
        setLocaleState(nextLocale);
    }, []);

    /**
     * Fonction principale de traduction.
     * Utilise les effets de fallback pour robustesse :
     * 
     * 1. Cherche la clé dans la locale actuelle
     * 2. Si pas trouvée → cherche dans la locale par défaut (anglais)
     * 3. Si toujours pas trouvée → retourne la clé elle-même (mode "debug")
     * 
     * Applique aussi les paramètres pour remplacer {placeholder} par leurs valeurs.
     */
    const t = useCallback((key: string, params?: Record<string, string | number>) => {
        // Accède à l'arbre de traduction de la locale actuelle (ex: translations["fr"])
        const current = translations[locale];
        
        // Arbre de fallback (anglais) pour les traductions manquantes
        const fallback = translations[defaultLocale];
        
        /**
         * Navigue dans l'arbre imbriqué selon le chemin de la clé.
         * Exemple "auth.login.submit" :
         *   - Regarde translations[locale]["auth"]["login"]["submit"]
         *   - Si undefined → regarde translations["en"]["auth"]["login"]["submit"]
         *   - Si toujours undefined → retourne "auth.login.submit" brute (c'est un bug à corriger)
         */
        const translatedValue = getTranslation(current, key) ?? getTranslation(fallback, key) ?? key;
        
        // Remplace les {placeholder} par leurs valeurs
        // Exemple "You have {count} messages" + {count: 5} → "You have 5 messages"
        return applyTranslationParams(translatedValue, params);
    }, [locale]);

    /**
     * Mémoïse l'objet du contexte pour éviter les rerenders inutiles.
     * Les composants qui appellent useI18n() ne se rerendent que si l'une
     * de ces valeurs change, pas à chaque render du provider.
     */
    const value = useMemo<I18nContextType>(() => ({
        locale,
        direction: getLocaleDirection(locale),
        isRtl: getLocaleDirection(locale) === "rtl",
        setLocale,
        t,
    }), [locale, setLocale, t]);

    // Expose le contexte à toute l'arborescence React
    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * HOOK pour accéder à l'API i18n n'importe où dans l'app.
 * 
 * Utilisation typiqu dans n'importe quel composant :
 *   const { t, locale, setLocale } = useI18n();
 *   return <button>{t("common.login")}</button>;
 * 
 * Remarque : Doit être utilisé avec le Provider sous-jacent, sinon lève une erreur.
 */
export function useI18n() {
    const context = useContext(I18nContext);

    // Sécurité : s'assure que le composant est bien enveloppé par <I18nProvider>
    if (!context) {
        throw new Error("useI18n must be used inside an I18nProvider");
    }

    return context;
}
