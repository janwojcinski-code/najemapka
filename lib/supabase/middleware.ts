import { createServerClient } from "@supabase/ssr";
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
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        }
      }
    }
  );

  const pathname = request.nextUrl.pathname;
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

  if (profileError || !profile) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/logowanie";
    redirectUrl.searchParams.set("error", "missing_profile");
    return NextResponse.redirect(redirectUrl);
  }

  const typedProfile = profile as ProfileRoleResponse;

  if (typedProfile.role !== "admin" && typedProfile.role !== "tenant") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/logowanie";
    redirectUrl.searchParams.set("error", "unknown_role");
    return NextResponse.redirect(redirectUrl);
  }

  const targetDashboard = getRedirectPathForRole(typedProfile.role);

  if (isAuthRoute(pathname) || pathname === "/") {
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
