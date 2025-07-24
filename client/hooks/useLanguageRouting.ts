import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Language, useI18n } from "./useI18n";

const SUPPORTED_LANGUAGES = ["ru", "en", "uz"];

export function useLanguageRouting() {
  const { lang } = useParams<{ lang?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage } = useI18n();

  // Check if current URL has a language prefix
  const currentLangFromUrl = lang as Language | undefined;

  useEffect(() => {
    // If URL has a valid language prefix, update the language state
    if (
      currentLangFromUrl &&
      SUPPORTED_LANGUAGES.includes(currentLangFromUrl)
    ) {
      if (language !== currentLangFromUrl) {
        setLanguage(currentLangFromUrl);
      }
    }
  }, [currentLangFromUrl, language, setLanguage]);

  const navigateToLanguage = (newLanguage: Language) => {
    const currentPath = location.pathname;
    let newPath: string;

    // Remove current language prefix if exists
    const pathWithoutLang = currentLangFromUrl
      ? currentPath.replace(`/${currentLangFromUrl}`, "") || "/"
      : currentPath;

    // Add new language prefix
    newPath = `/${newLanguage}${pathWithoutLang === "/" ? "" : pathWithoutLang}`;

    // Update language state and navigate
    setLanguage(newLanguage);
    navigate(newPath);
  };

  const getLocalizedPath = (path: string) => {
    if (currentLangFromUrl) {
      return `/${currentLangFromUrl}${path === "/" ? "" : path}`;
    }
    return path;
  };

  return {
    currentLanguage: currentLangFromUrl || language,
    navigateToLanguage,
    getLocalizedPath,
    hasLanguagePrefix: !!currentLangFromUrl,
  };
}
