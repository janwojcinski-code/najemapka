import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

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

          supabaseResponse = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options as never);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isTenantRoute = pathname.startsWith("/najemca");
  const isLoginRoute = pathname === "/logowanie" || pathname.startsWith("/logowanie?");

  if (!user) {
    if (isAdminRoute || isTenantRoute) {
      return NextResponse.redirect(new URL("/logowanie", request.url));
    }
    return supabaseResponse;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.role) {
    if (isLoginRoute) {
      return supabaseResponse;
    }

    return NextResponse.redirect(
      new URL("/logowanie?error=missing_profile", request.url)
    );
  }

  if (isAdminRoute && profile.role !== "admin") {
    return NextResponse.redirect(new URL("/najemca/dashboard", request.url));
  }

  if (isTenantRoute && profile.role !== "tenant") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  if (isLoginRoute) {
    if (profile.role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    return NextResponse.redirect(new URL("/najemca/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
