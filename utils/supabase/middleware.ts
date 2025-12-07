import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { Database } from "@/types/database";

const ROUTE_PROTECTION = {
  // Format: route pattern: required role (null means any authenticated user)
  "/dashboard": null,
  "/dashboard/statistics": null,
  "/dashboard/patients": null,
  "/dashboard/patients/new": null,
  "/dashboard/work-units": null,
  "/dashboard/settings": null,
  "/dashboard/settings/users": null,
  "/dashboard/company": null,
  "/dashboard/company/employees": null,
  "/dashboard/company/services": null,
  "/dashboard/company/employees/new": null,
  "/dashboard/unauthorized": null,
};

// Define supported locales
const SUPPORTED_LOCALES = ["en", "sr-Latn", "ru"];

export async function updateSession(
  request: NextRequest,
  response: NextResponse,
) {
  try {
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      },
    );

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get user's role if they're authenticated

    // Extract locale from the URL path
    const pathParts = request.nextUrl.pathname.split("/");
    let locale = pathParts[1];

    // Check if the first part is a valid locale
    if (!SUPPORTED_LOCALES.includes(locale)) {
      // If not a valid locale, check for saved preference in cookie
      const savedLocale = request.cookies.get("NEXT_LOCALE")?.value;

      // Use saved locale or default to 'en'
      locale = savedLocale && SUPPORTED_LOCALES.includes(savedLocale)
        ? savedLocale
        : "en";

      // If we're at the root URL, check for last path
      if (request.nextUrl.pathname === "/") {
        const lastPath = request.cookies.get("LAST_PATH")?.value;

        if (lastPath && user) {
          return NextResponse.redirect(
            new URL(`/${locale}${lastPath}`, request.url),
          );
        } else {
          return NextResponse.redirect(new URL(`/${locale}`, request.url));
        }
      }
    }

    const path = request.nextUrl.pathname;
    const cleanPath = path.replace(new RegExp(`^/${locale}`), ""); // Remove locale prefix

    // Check if current path requires authentication or specific role
    for (
      const [routePattern, requiredRole] of Object.entries(ROUTE_PROTECTION)
    ) {
      if (cleanPath.startsWith(routePattern) || cleanPath === routePattern) {
        // Route requires authentication
        if (!user) {
          // Redirect to login page with return URL
          const returnUrl = encodeURIComponent(request.nextUrl.pathname);
          return NextResponse.redirect(
            new URL(`/${locale}?returnUrl=${returnUrl}`, request.url),
          );
        }

        // Route requires specific role
        if (requiredRole) {
          // Redirect to dashboard or unauthorized page
          return NextResponse.redirect(
            new URL(`/${locale}/dashboard/unauthorized`, request.url),
          );
        }
      }
    }

    // Redirect authenticated users away from public pages like login/register
    const publicOnlyPages = ["/"];
    if (publicOnlyPages.includes(cleanPath) && user) {
      return NextResponse.redirect(
        new URL(`/${locale}/dashboard`, request.url),
      );
    }

    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    // In case of error, let the request proceed
    // This prevents users from being locked out if there's an issue
    return response;
  }
}
