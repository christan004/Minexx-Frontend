import React from 'react';

export const LanguageContext = React.createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = React.useState(localStorage.getItem('_lang') || 'en');

  const changeLanguage = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('_lang', newLang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};