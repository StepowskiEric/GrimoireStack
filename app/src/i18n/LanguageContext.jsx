import { createContext, useContext, useMemo } from 'react';
import { useMessages } from './messages';

export const LanguageContext = createContext({
  lang: 'grimoire',
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }) {
  const { lang, setLang, t } = useMessages();
  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
