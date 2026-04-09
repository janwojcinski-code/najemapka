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