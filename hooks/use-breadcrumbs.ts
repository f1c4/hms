"use client";

import { usePathname } from "@/i18n/navigation";
import { useMemo } from "react";
import { useTranslations } from "next-intl";

type BreadcrumbItem = {
  title: string;
  link: string;
};

export function useBreadcrumbs() {
  const t = useTranslations("Layout.Breadcrumbs");
  const pathname = usePathname();

  const routeMapping = useMemo<Record<string, BreadcrumbItem[]>>(
    () => ({
      "/dashboard/statistics": [
        { title: "HMS Vraneš", link: "#" },
        { title: t("statistics"), link: "/dashboard/statistics" },
      ],
      "/dashboard/patients": [
        { title: "HMS Vraneš", link: "#" },
        { title: t("patients"), link: "/dashboard/patients" },
      ],
      "/dashboard/patients/new": [
        { title: "HMS Vraneš", link: "#" },
        { title: t("patients"), link: "/dashboard/patients" },
        { title: t("patientNew"), link: "/dashboard/patients/new" },
      ],
      "/dashboard/work-units": [
        { title: "HMS Vraneš", link: "#" },
        { title: t("ambulances"), link: "/dashboard/work-units" },
      ],
      "/dashboard/settings/users": [
        { title: "HMS Vraneš", link: "#" },
        { title: t("settings"), link: "#" },
        { title: t("users"), link: "/dashboard/settings/users" },
      ],
      "/dashboard/settings/systemdata": [
        { title: "HMS Vraneš", link: "#" },
        { title: t("settings"), link: "#" },
        { title: t("systemData"), link: "/dashboard/settings/systemdata" },
      ],
      "/dashboard/companies": [
        { title: "HMS Vraneš", link: "#" },
        { title: t("companies"), link: "/dashboard/companies" },
      ],
      "/dashboard/company": [
        { title: "HMS Vraneš", link: "#" },
        { title: t("clinic"), link: "/dashboard/company" },
      ],
      "/dashboard/company/info": [
        { title: "HMS Vraneš", link: "#" },
        { title: t("clinic"), link: "#" },
        { title: t("companyInfo"), link: "/dashboard/company/info" },
      ],
      "/dashboard/company/employees": [
        { title: "HMS Vraneš", link: "#" },
        { title: t("clinic"), link: "/dashboard/company" },
        { title: t("employees"), link: "/dashboard/company/employees" },
      ],
      "/dashboard/company/services": [
        { title: "HMS Vraneš", link: "#" },
        { title: t("clinic"), link: "/dashboard/company" },
        { title: t("servicesList"), link: "/dashboard/company/services" },
      ],
      "/dashboard/company/employees/new": [
        { title: "HMS Vraneš", link: "#" },
        { title: t("clinic"), link: "/dashboard/company" },
        { title: t("employees"), link: "/dashboard/company/employees" },
        { title: t("employeesNew"), link: "/dashboard/company/employees/new" },
      ],
    }),
    [t],
  );

  // This is the route pattern mapping for dynamic routes
  const dynamicRoutePatterns = useMemo(
    () => ({
      "/dashboard/patients/[patientid]": {
        pattern: /^\/dashboard\/patients\/(?!new$)([^/]+)$/,
        breadcrumbs: (id: string) => [
          { title: "HMS Vraneš", link: "#" },
          { title: t("patients"), link: "/dashboard/patients" },
          { title: t("patientid"), link: `/dashboard/patients/${id}` },
        ],
      },
      "/dashboard/company/employees/[employeeid]": {
        pattern: /^\/dashboard\/company\/employees\/(?!new$)([^/]+)$/,
        breadcrumbs: (id: string) => [
          { title: "HMS Vraneš", link: "#" },
          { title: t("company"), link: "/dashboard/company" },
          { title: t("employees"), link: "/dashboard/company/employees" },
          {
            title: t("employeesId"),
            link: `/dashboard/company/employees/${id}`,
          },
        ],
      },
      // Add more dynamic route patterns as needed
    }),
    [t],
  );

  const breadcrumbs = useMemo(() => {
    // First check for exact static routes
    if (routeMapping[pathname]) {
      return routeMapping[pathname];
    }

    // Then check for dynamic routes
    for (const [, config] of Object.entries(dynamicRoutePatterns)) {
      const match = pathname.match(config.pattern);
      if (match) {
        const id = match[1];
        return config.breadcrumbs(id);
      }
    }

    // Fallback to generating breadcrumbs from path segments
    const segments = pathname.split("/").filter(Boolean);
    const dynamicBreadcrumbs: BreadcrumbItem[] = [];

    segments.forEach((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join("/")}`;

      // Check if this segment might be a parameter (like an ID)
      const isLikelyParameter = !isNaN(Number(segment)) ||
        (segment.length >= 24 && /^[a-f0-9]+$/i.test(segment));

      let title;
      if (isLikelyParameter && index > 0) {
        // Try to get a translation for the parameter type based on the previous segment
        const paramType = segments[index - 1].slice(0, -1); // Remove 's' from plural
        title = t(`${paramType}id`, { defaultValue: segment });
      } else {
        title = segment.charAt(0).toUpperCase() + segment.slice(1);
      }

      dynamicBreadcrumbs.push({
        title,
        link: path,
      });
    });

    return dynamicBreadcrumbs;
  }, [pathname, t, routeMapping, dynamicRoutePatterns]);

  return breadcrumbs;
}
