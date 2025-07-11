import { useState, ReactNode } from "react";
import {
  I18nContext,
  Language,
  translations,
  formatMessage,
} from "@/hooks/useI18n";

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguage] = useState<Language>("ru");

  const value = {
    language,
    setLanguage,
    t: translations[language],
    formatMessage,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
