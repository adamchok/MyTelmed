import { resolve } from "path";

export const nextI18NextConfig = {
  i18n: {
    locales: ["en", "cn", "my"],
    defaultLocale: "en",
    fallbackLng: "en",
    localePath: resolve("./public/locales"),
  },
  ns: ["dashboard", "sidebar", "sign-in", "forum", "forgot-password", "forgot-email", "landing"],
  defaultNS: "dashboard",
  react: { useSuspense: false },
};
