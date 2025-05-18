import { initReactI18next } from "react-i18next";
import { nextI18NextConfig } from "../next-i18next.config";
import i18n from "i18next";
import enSidebarTranslations from "../public/locales/en/sidebar.json";
import enSignInTranslations from "../public/locales/en/sign-in.json";
import enForgotPasswordTranslations from "../public/locales/en/forgot-password.json";
import enLanguageTranslations from "../public/locales/en/language.json";
import enForgotEmailTranslations from "../public/locales/en/forgot-email.json";
import enForumTranslations from "../public/locales/en/forum.json";
import enLandingTranslations from "../public/locales/en/landing.json";
import cnSidebarTranslations from "../public/locales/cn/sidebar.json";
import cnSignInTranslations from "../public/locales/cn/sign-in.json";
import cnForgotPasswordTranslations from "../public/locales/cn/forgot-password.json";
import cnLanguageTranslations from "../public/locales/cn/language.json";
import cnForgotEmailTranslations from "../public/locales/cn/forgot-email.json";
import cnForumTranslations from "../public/locales/cn/forum.json";
import cnLandingTranslations from "../public/locales/cn/landing.json";
import mySidebarTranslations from "../public/locales/my/sidebar.json";
import mySignInTranslations from "../public/locales/my/sign-in.json";
import myForgotPasswordTranslations from "../public/locales/my/forgot-password.json";
import myLanguageTranslations from "../public/locales/my/language.json";
import myForgotEmailTranslations from "../public/locales/my/forgot-email.json";
import myForumTranslations from "../public/locales/my/forum.json";
import myLandingTranslations from "../public/locales/my/landing.json";

i18n.use(initReactI18next).init({
  ...nextI18NextConfig,
  lng: "en",
  fallbackLng: "en",
  resources: {
    en: {
      sidebar: enSidebarTranslations,
      signIn: enSignInTranslations,
      forgetPassword: enForgotPasswordTranslations,
      language: enLanguageTranslations,
      forgotEmail: enForgotEmailTranslations,
      forum: enForumTranslations,
      landing: enLandingTranslations,
    },
    cn: {
      sidebar: cnSidebarTranslations,
      signIn: cnSignInTranslations,
      forgetPassword: cnForgotPasswordTranslations,
      language: cnLanguageTranslations,
      forgotEmail: cnForgotEmailTranslations,
      forum: cnForumTranslations,
      landing: cnLandingTranslations,
    },
    my: {
      sidebar: mySidebarTranslations,
      signIn: mySignInTranslations,
      forgetPassword: myForgotPasswordTranslations,
      language: myLanguageTranslations,
      forgotEmail: myForgotEmailTranslations,
      forum: myForumTranslations,
      landing: myLandingTranslations,
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
