export type AppRole = "admin" | "tenant";

export function isAdmin(role: string): role is "admin" {
  return role === "admin";
}

export function isTenant(role: string): role is "tenant" {
  return role === "tenant";
}

export function getDashboardPath(role: AppRole): string {
  if (role === "admin") return "/admin/dashboard";
  return "/najemca/dashboard";
}

// Alias używany w proxy.ts i innych miejscach projektu
export function getRedirectPathForRole(role: string): string {
  if (role === "admin") return "/admin/dashboard";
  if (role === "tenant") return "/najemca/dashboard";
  return "/logowanie";
}

export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith("/admin");
}

export function isTenantRoute(pathname: string): boolean {
  return pathname.startsWith("/najemca");
}

export function isAuthRoute(pathname: string): boolean {
  return (
    pathname === "/logowanie" ||
    pathname === "/rejestracja" ||
    pathname === "/odzyskiwanie-hasla" ||
    pathname.startsWith("/logowanie") ||
    pathname.startsWith("/rejestracja") ||
    pathname.startsWith("/odzyskiwanie-hasla")
  );
}
