import { resolve } from "path";

export const nextI18NextConfig = {
  i18n: {
    locales: ["en", "cn"], // Add your supported languages here
    defaultLocale: "en", // Set your default language
    fallbackLng: "en",
    localePath: resolve("./public/locales"),
  },
  ns: ["dashboard", "header", "trades", "sign-in"],
  defaultNS: "dashboard",
  react: { useSuspense: false },
};
