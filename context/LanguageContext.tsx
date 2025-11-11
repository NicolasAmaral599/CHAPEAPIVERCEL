import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo } from 'react';
import { translations } from '../i18n/translations';

type Language = 'pt' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  formatDate: (date: string | Date) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'pt';
  });

  const setLanguage = (lang: Language) => {
    localStorage.setItem('language', lang);
    setLanguageState(lang);
  };

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let result = translations[language];
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = (result as any)[k];
      } else {
        return key; // Return key if not found
      }
    }
    return typeof result === 'string' ? result : key;
  }, [language]);

  const formatDate = useCallback((date: string | Date): string => {
    const locale = language === 'pt' ? 'pt-BR' : 'en-US';
    
    let dateObj: Date;

    // The core issue is that `new Date('YYYY-MM-DD')` is parsed as UTC midnight.
    // To ensure it's treated as a local date, we parse it manually.
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        const [year, month, day] = date.split('-').map(Number);
        dateObj = new Date(year, month - 1, day);
    } else {
        // Handles Date objects and other string formats (e.g., ISO with time)
        dateObj = new Date(date);
    }
    
    return dateObj.toLocaleDateString(locale);
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, t, formatDate }), [language, t, formatDate]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslations = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslations must be used within a LanguageProvider');
  }
  return context;
};