import type { UserRole } from "@/types";

export const AUTH_ROUTES = ["/logowanie", "/rejestracja", "/reset-hasla"];

export const DEFAULT_AFTER_LOGIN: Record<UserRole, string> = {
  admin: "/admin/dashboard",
  tenant: "/najemca/dashboard"
};

export function getRedirectPathForRole(role: UserRole) {
  return DEFAULT_AFTER_LOGIN[role];
}

export function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function isAdminRoute(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function isTenantRoute(pathname: string) {
  return pathname === "/najemca" || pathname.startsWith("/najemca/");
}