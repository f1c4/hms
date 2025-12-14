"use client";

import {
  Building2,
  ChartNoAxesCombined,
  Handshake,
  HeartHandshake,
  HousePlus,
  Settings2,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

export function useSidebarData() {
  const ts = useTranslations("Layout.Sidebar");

  const navMenuData = useMemo(
    () => ({
      user: {
        name: "Jelena Filipovic",
        email: "jelena@vranes.com",
        avatar: "https://avatar.iran.liara.run/public/91",
        image: "https://avatar.iran.liara.run/public/91",
      },
      navMain: [
        {
          title: ts("statistics"),
          url: `/dashboard/statistics`,
          icon: ChartNoAxesCombined,
          isActive: false,
          shortcut: ["s", "s"],
          items: [],
        },
        {
          title: ts("patients"),
          url: `/dashboard/patients`,
          icon: Users,
          isActive: false,
          shortcut: ["p", "p"],
          items: [],
        },
        {
          title: ts("examinations"),
          url: "/dashboard/services",
          icon: HeartHandshake,
          isActive: false,
          shortcut: ["t", "t"],
          items: [],
        },
        {
          title: ts("ambulances"),
          url: "/dashboard/work-units",
          icon: HousePlus,
          isActive: false,
          shortcut: ["a", "a"],
          items: [],
        },
        {
          title: ts("companies"),
          url: "/dashboard/companies",
          icon: Handshake,
          isActive: false,
          shortcut: ["c", "c"],
          items: [],
        },
        {
          title: ts("company"),
          url: "#",
          icon: Building2,
          isActive: false,
          shortcut: [],
          items: [
            {
              title: ts("companyInfo"),
              url: "/dashboard/company",
              shortcut: ["c", "c"],
            },
            {
              title: ts("employees"),
              url: "/dashboard/company/employees",
              shortcut: ["z", "z"],
            },
            {
              title: ts("servicesList"),
              url: "/dashboard/company/services",
              shortcut: ["o", "o"],
            },
          ],
        },
        {
          title: ts("settings"),
          url: "/dashboard/settings",
          icon: Settings2,
          isActive: false,
          shortcut: ["t", "t"],
          items: [
            {
              title: ts("users"),
              url: "/dashboard/settings/users",
              shortcut: ["u", "u"],
            },
            {
              title: ts("systemData"),
              url: "/dashboard/settings/systemdata",
              shortcut: ["s", "d"],
            },
          ],
        },
      ],
    }),
    [ts],
  );
  return { navMenuData };
}
