import type { Department } from "../props";

export const departments = (t: any): Department[] => {
  return [
    {
      key: "general",
      label: t("general"),
      image: "/icons/forum/general-medicine-icon.png",
      description: t("general-description"),
    },
    {
      key: "pediatrics",
      label: t("pediatrics"),
      image: "/icons/forum/pediatrics-icon.png",
      description: t("pediatrics-description"),
    },
    {
      key: "obgyn",
      label: t("obgyn"),
      image: "/icons/forum/obgyn-icon.png",
      description: t("obgyn-description"),
    },
    {
      key: "mental",
      label: t("mental"),
      image: "/icons/forum/mental-health-icon.png",
      description: t("mental-description"),
    },
  ];
};
