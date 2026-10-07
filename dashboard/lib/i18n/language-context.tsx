"use client";

import * as React from "react";

export type Language = "ar" | "en";

interface LanguageContextValue {
  language: Language;
  isRTL: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = React.createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "valentia_dashboard_lang";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default to Arabic as primary locale with lazy localStorage restoration
  const [language, setLanguageState] = React.useState<Language>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
        if (stored === "ar" || stored === "en") {
          return stored;
        }
      } catch {
        // Ignore localStorage errors
      }
    }
    return "ar";
  });

  const isRTL = language === "ar";

  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
      document.documentElement.dir = isRTL ? "rtl" : "ltr";
    }
  }, [language, isRTL]);

  const setLanguage = React.useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const toggleLanguage = React.useCallback(() => {
    setLanguageState((prev: Language) => {
      const nextLang: Language = prev === "ar" ? "en" : "ar";
      try {
        localStorage.setItem(STORAGE_KEY, nextLang);
      } catch {
        // Ignore storage errors
      }
      return nextLang;
    });
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        language,
        isRTL,
        setLanguage,
        toggleLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = React.useContext(LanguageContext);
  if (!context) {
    // Return safe fallback if used outside provider
    return {
      language: "ar" as Language,
      isRTL: true,
      setLanguage: () => {},
      toggleLanguage: () => {},
    };
  }
  return context;
}
