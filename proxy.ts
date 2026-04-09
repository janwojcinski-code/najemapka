import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Brak sesji → tylko auth routes dostępne
  if (!user) {
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/najemca")
    ) {
      return NextResponse.redirect(new URL("/logowanie", request.url));
    }
    return supabaseResponse;
  }

  // Mamy usera — sprawdź rolę
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  // Brak profilu → bezpieczna strona błędu, bez pętli
  if (!profile) {
    if (pathname === "/logowanie") return supabaseResponse;
    return NextResponse.redirect(
      new URL("/logowanie?error=missing_profile", request.url)
    );
  }

  const role = profile.role as string;

  // Tenant próbuje wejść na /admin/*
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/najemca/dashboard", request.url));
  }

  // Admin próbuje wejść na /najemca/*
  if (pathname.startsWith("/najemca") && role !== "tenant") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  // Zalogowany user na /logowanie → redirect po roli
  if (pathname === "/logowanie") {
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    if (role === "tenant") {
      return NextResponse.redirect(
        new URL("/najemca/dashboard", request.url)
      );
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};