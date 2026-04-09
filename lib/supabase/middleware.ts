import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { UserRole } from "@/types";
import {
  getRedirectPathForRole,
  isAdminRoute,
  isAuthRoute,
  isTenantRoute
} from "@/lib/auth/roles";

type ProfileRoleResponse = {
  role: UserRole;
};

type CookieToSet = {
  name: string;
  value: string;
  options?: CookieOptions;
};

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        }
      }
    }
  );

  const pathname = request.nextUrl.pathname;
  const currentError = request.nextUrl.searchParams.get("error");

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    if (isAdminRoute(pathname) || isTenantRoute(pathname)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/logowanie";
      redirectUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    return response;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const hasValidRole =
    !profileError &&
    profile &&
    (profile as ProfileRoleResponse).role &&
    ((profile as ProfileRoleResponse).role === "admin" ||
      (profile as ProfileRoleResponse).role === "tenant");

  if (!hasValidRole) {
    if (isAuthRoute(pathname)) {
      return response;
    }

    if (isAdminRoute(pathname) || isTenantRoute(pathname) || pathname === "/") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/logowanie";
      redirectUrl.searchParams.set(
        "error",
        profileError ? "profile_access_error" : "missing_profile"
      );
      return NextResponse.redirect(redirectUrl);
    }

    return response;
  }

  const typedProfile = profile as ProfileRoleResponse;
  const targetDashboard = getRedirectPathForRole(typedProfile.role);

  if (isAuthRoute(pathname) || pathname === "/") {
    if (
      pathname === "/logowanie" &&
      (currentError === "missing_profile" ||
        currentError === "unknown_role" ||
        currentError === "profile_access_error")
    ) {
      return response;
    }

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = targetDashboard;
    redirectUrl.searchParams.delete("error");
    redirectUrl.searchParams.delete("next");
    return NextResponse.redirect(redirectUrl);
  }

  if (typedProfile.role === "tenant" && isAdminRoute(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/najemca/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  if (typedProfile.role === "admin" && isTenantRoute(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}