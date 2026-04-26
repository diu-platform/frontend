// i18n/LanguageContext.tsx
/**
 * Language Context for DIU Physics Interactive
 * Supports 8 languages with RTL support for Arabic
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getTranslation, LANGUAGES, type Language } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
  languageInfo: typeof LANGUAGES[Language];
  availableLanguages: typeof LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('diu-language', lang);
      // DON'T apply RTL to document - it breaks the 3D layout
      // RTL is handled per-component via isRTL context value
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('diu-language') as Language;
      if (saved && LANGUAGES[saved]) {
        setLanguageState(saved);
      }
    }
  }, []);

  const t = (key: string): string => getTranslation(key, language);

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      t,
      isRTL: LANGUAGES[language].rtl,
      languageInfo: LANGUAGES[language],
      availableLanguages: LANGUAGES,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  
  // Return both 'language' and 'lang' for compatibility
  return {
    ...context,
    lang: context.language, // alias for backward compatibility
  };
}

/**
 * Language Switcher Dropdown Component
 */
export function LanguageSwitcher() {
  const { language, setLanguage, availableLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = availableLanguages[language];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
      >
        <span>{currentLang.flag}</span>
        <span className="text-sm text-white">{currentLang.nativeName}</span>
        <span className="text-gray-400 text-xs">▼</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute top-full right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 min-w-[180px] overflow-hidden">
            {Object.entries(availableLanguages).map(([code, info]) => {
              const isSelected = code === language;
              return (
                <button
                  key={code}
                  onClick={() => { 
                    setLanguage(code as Language); 
                    setIsOpen(false); 
                  }}
                  className={`w-full px-3 py-2 flex items-center gap-3 hover:bg-slate-700 transition-colors ${
                    isSelected ? 'bg-indigo-600/30' : ''
                  }`}
                >
                  <span className="text-lg">{info.flag}</span>
                  <div className="flex-1 text-left">
                    <span className="text-sm text-white">{info.nativeName}</span>
                  </div>
                  {!info.verified && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-yellow-600/50 text-yellow-300 rounded">
                      β
                    </span>
                  )}
                  {isSelected && (
                    <span className="text-green-400">✓</span>
                  )}
                </button>
              );
            })}
            
            {/* Help improve notice */}
            <div className="px-3 py-2 bg-slate-900/50 border-t border-slate-700">
              <p className="text-[10px] text-gray-500">
                🇨🇳🇸🇦 Need native review
              </p>
              <a 
                href="https://github.com/desci-intelligent-universe/diu-physics/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-indigo-400 hover:underline"
              >
                Help improve →
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Compact language switcher (flags only)
 */
export function LanguageSwitcherCompact() {
  const { language, setLanguage, availableLanguages } = useLanguage();
  
  const primaryLanguages: Language[] = ['en', 'ru', 'es', 'de', 'fr', 'pt', 'zh', 'ar'];

  return (
    <div className="flex flex-wrap gap-1 bg-slate-800/50 rounded-lg p-1">
      {primaryLanguages.map((code) => {
        const info = availableLanguages[code];
        const isSelected = language === code;
        return (
          <button
            key={code}
            onClick={() => setLanguage(code)}
            className={`px-2 py-1 text-sm rounded transition-all ${
              isSelected 
                ? 'bg-indigo-600 scale-110' 
                : 'hover:bg-slate-700 opacity-70 hover:opacity-100'
            }`}
            title={`${info.nativeName} (${info.name})`}
          >
            {info.flag}
          </button>
        );
      })}
    </div>
  );
}
