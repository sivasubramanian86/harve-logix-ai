import React, { createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';

const I18nContext = createContext();

export const I18nProvider = ({ children }) => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const value = {
    currentLanguage: i18n.language,
    changeLanguage,
    t,
    i18n,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
};
