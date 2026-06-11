import { createContext, useContext } from 'react';
import { useMessages } from './messages';

export const LanguageContext = createContext({
  lang: 'grimoire',
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }) {
  const { lang, setLang, t } = useMessages();
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
