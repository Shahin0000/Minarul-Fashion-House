import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '../data/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: typeof translations['en'];
  formatPrice: (amount: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('mfh_lang');
      return (saved === 'bn' || saved === 'en') ? saved : 'bn'; // Default to Bengali for target audience
    } catch {
      return 'bn';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('mfh_lang', lang);
    } catch {}
  };

  const toggleLanguage = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = translations[language] || translations['en'];

  const formatPrice = (amount: number) => {
    // English or Bengali numerals formatting with ৳ sign
    if (language === 'bn') {
      const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
      const str = Math.round(amount).toLocaleString('en-US');
      const bnStr = str.replace(/[0-9]/g, (d) => bnDigits[parseInt(d, 10)]);
      return `৳${bnStr}`;
    }
    return `৳${Math.round(amount).toLocaleString('en-US')}`;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, formatPrice }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
