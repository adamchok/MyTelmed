import { initReactI18next } from "react-i18next";
import { nextI18NextConfig } from "../next-i18next.config";
import i18n from "i18next";
import enHeaderTranslations from "../public/locales/en/header.json";
import enSignInTranslations from "../public/locales/en/sign-in.json";
import cnHeaderTranslations from "../public/locales/cn/header.json";
import cnSignInTranslations from "../public/locales/cn/sign-in.json";
import myHeaderTranslations from "../public/locales/my/header.json";
import mySignInTranslations from "../public/locales/my/sign-in.json";

i18n.use(initReactI18next).init({
  ...nextI18NextConfig,
  lng: "en",
  fallbackLng: "en",
  resources: {
    en: {
      header: enHeaderTranslations,
      signIn: enSignInTranslations,
    },
    cn: {
      header: cnHeaderTranslations,
      signIn: cnSignInTranslations,
    },
    my: {
      header: myHeaderTranslations,
      signIn: mySignInTranslations,
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
