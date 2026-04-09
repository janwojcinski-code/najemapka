import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRedirectPathForRole } from "@/lib/auth/roles";
import type { UserRole } from "@/types";

export type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  created_at?: string;
};

export async function getCurrentUserProfile(): Promise<ProfileRow | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Błąd odczytu public.profiles: ${profileError.message}`);
  }

  return (profile as ProfileRow | null) ?? null;
}

export async function requireAuthenticatedProfile(
  allowedRole?: UserRole
): Promise<ProfileRow> {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/logowanie?error=missing_profile");
  }

  if (profile.role !== "admin" && profile.role !== "tenant") {
    redirect("/logowanie?error=unknown_role");
  }

  if (allowedRole && profile.role !== allowedRole) {
    redirect(getRedirectPathForRole(profile.role));
  }

  return profile;
}